const Waste = require("../Model/plastic");
const User = require("../Model/Home");
const Collector = require("../Model/Collector");
const Rewards = require("../Model/Rewards");
const conn = require("../Utils/database");

exports.adminDashboard = (req, resp, next) => {
  try {
    console.log("Admin Dashboard accessed");

    const admin = req.session.user;

    if (!admin || !admin.id) {
      return resp
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { userType } = admin;

    if (userType !== "admin") {
      console.warn("Unauthorized access attempt - user type mismatch");
      return resp
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    conn.query(
      "SELECT * FROM admin WHERE id = ?",
      [admin.id],
      (err, adminResults) => {
        if (err) {
          console.error("Database error fetching admin:", err);
          return resp.status(500).json({
            success: false,
            message: "Database error while fetching admin data",
          });
        }

        if (!adminResults || adminResults.length === 0) {
          console.warn("Admin not found for ID:", admin.id);
          return resp.status(404).json({
            success: false,
            message: "Admin not found",
          });
        }

        const adminData = adminResults[0];
        const sql = `
SELECT
 (SELECT IFNULL(SUM(quantity),0) FROM waste_requests WHERE status='completed') AS total_waste_collected,
 (SELECT COUNT(*) FROM users) AS total_users,
 (SELECT COUNT(*) FROM user_coupons) AS total_coupons_redeemed
`;

        conn.query(sql, (err, data) => {
          if (err) {
            console.error("Error fetching stats:", err);
            return resp.status(500).json({
              success: false,
              message: "Error fetching dashboard statistics",
            });
          }

          const stats = data[0];

          User.getAllUsers((err, userResults) => {
            if (err) {
              console.error("Error fetching users:", err);
              return resp.status(500).json({
                success: false,
                message: "Error fetching users data",
              });
            }

            Collector.getAllCollectors((err, collectorResults) => {
              if (err) {
                console.error("Error fetching collectors:", err);
                return resp.status(500).json({
                  success: false,
                  message: "Error fetching collectors data",
                });
              }

              Waste.MonthlyWaste((err, rows) => {
                if (err) {
                  console.error("Error fetching monthly waste:", err);
                  return resp.status(500).json({
                    success: false,
                    message: "Error fetching monthly waste data",
                  });
                }

                let months = [];
                let values = [];

                if (rows && rows.length > 0) {
                  rows.forEach((row) => {
                    months.push(row.month);
                    values.push(row.total_waste);
                  });
                }

                Waste.CountWaste((err, result) => {
                  if (err) {
                    console.error("Error counting waste:", err);
                    return resp.status(500).json({
                      success: false,
                      message: "Error fetching waste count",
                    });
                  }

                  const completed = result?.completed_count || 0;
                  const pending = result?.pending_count || 0;
                  const accepted = result?.accepted_count || 0;
                  const cancelled = result?.cancelled_count || 0;

                  console.log("Admin dashboard data retrieved successfully");
                  resp.json({
                    success: true,
                    user: adminData,
                    users: userResults || [],
                    collectors: collectorResults || [],
                    waste: stats.total_waste_collected || 0,
                    total_users: stats.total_users || 0,
                    redeemed: stats.total_coupons_redeemed || 0,
                    monthlyWaste: {
                      months: months,
                      values: values,
                    },
                    requestStatus: {
                      completed: completed,
                      pending: pending,
                      accepted: accepted,
                      cancelled: cancelled,
                    },
                  });
                });
              });
            });
          });
        });
      },
    );
  } catch (error) {
    console.error("Error in adminDashboard:", error);
    resp.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.Users = (req, res) => {
  try {
    const admin = req.session.user;

    if (!admin || !admin.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const id = admin.id;

    conn.query(
      "SELECT * FROM admin WHERE id = ?",
      [id],
      (err, adminResults) => {
        if (err) {
          console.error("Database error fetching admin:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }

        if (!adminResults || adminResults.length === 0) {
          console.warn("Admin not found");
          return res
            .status(404)
            .json({ success: false, message: "Admin not found" });
        }

        const adminData = adminResults[0];

        User.getAllUsers((err, users) => {
          if (err) {
            console.error("Error fetching users:", err);
            return res
              .status(500)
              .json({ success: false, message: "Error fetching users" });
          }

          res.json({ success: true, user: adminData, users: users || [] });
        });
      },
    );
  } catch (error) {
    console.error("Error in Users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.Collectors = (req, res) => {
  try {
    const admin = req.session.user;

    if (!admin || !admin.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    conn.query(
      "SELECT * FROM admin WHERE id = ?",
      [admin.id],
      (err, adminResults) => {
        if (err) {
          console.error("Database error fetching admin:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }

        if (!adminResults || adminResults.length === 0) {
          console.warn("Admin not found");
          return res
            .status(404)
            .json({ success: false, message: "Admin not found" });
        }

        const adminData = adminResults[0];

        Collector.getAllCollectors((err, collectors) => {
          if (err) {
            console.error("Error fetching collectors:", err);
            return res
              .status(500)
              .json({ success: false, message: "Error fetching collectors" });
          }

          res.json({
            success: true,
            user: adminData,
            collectors: collectors || [],
          });
        });
      },
    );
  } catch (error) {
    console.error("Error in Collectors:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.addCoupons = (req, res) => {
  try {
    const { title, description, pointsRequired, discount } = req.body;

    if (!title || !description || !pointsRequired || discount === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, points required, and discount are required",
      });
    }

    if (isNaN(pointsRequired) || pointsRequired <= 0) {
      return res.status(400).json({
        success: false,
        message: "Points required must be a positive number",
      });
    }

    if (isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be a number between 0 and 100",
      });
    }

    console.log("Adding coupon:", title);

    Rewards.addCoupon(
      title,
      description,
      pointsRequired,
      discount,
      (err, result) => {
        if (err) {
          console.error("Error adding coupon:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error adding coupon" });
        }

        res.json({ success: true, message: "Coupon added successfully" });
      },
    );
  } catch (error) {
    console.error("Error in addCoupons:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getCoupons = (req, res) => {
  try {
    Rewards.getAllCoupons((err, coupons) => {
      if (err) {
        console.error("Error fetching coupons:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error fetching coupons" });
      }

      res.json({ success: true, coupons: coupons || [] });
    });
  } catch (error) {
    console.error("Error in getCoupons:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteCoupons = (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon ID is required" });
    }

    Rewards.deleteCoupons(id, (err, result) => {
      if (err) {
        console.error("Error deleting coupon:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error deleting coupon" });
      }

      res.json({ success: true, message: "Coupon deleted successfully" });
    });
  } catch (error) {
    console.error("Error in deleteCoupons:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
