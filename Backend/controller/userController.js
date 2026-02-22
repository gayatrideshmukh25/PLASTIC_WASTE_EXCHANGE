const Waste = require("../Model/plastic");
const User = require("../Model/Home");
const Collector = require("../Model/Collector");
const Rewards = require("../Model/Rewards");
const conn = require("../Utils/database");

exports.userDashboard = (req, resp, next) => {
  try {
    const user = req.user;
    console.log("inside user");
    if (!user || !user.id) {
      return resp
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { id } = user;
    console.log("User ID from token:", id);

    User.getUserbyId(id, (err, userData) => {
      if (err) {
        console.error("Error fetching user:", err);
        return resp.status(500).json({
          success: false,
          message: "Database error while fetching user",
        });
      }

      if (!userData) {
        return resp
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (userData.userType !== "user") {
        console.warn("Unauthorized access attempt - user type mismatch");
        return resp
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
      }

      Waste.getRequestbyUser(id, (err, wasteLogged) => {
        if (err) {
          console.error("Error fetching waste requests:", err);
          return resp.status(500).json({
            success: false,
            message: "Database error while fetching requests",
          });
        }

        resp.json({
          success: true,
          user: userData,
          wasteLogged: wasteLogged || [],
        });
      });
    });
  } catch (error) {
    console.error("Error in userDashboard:", error);
    resp.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.sendRequest = (req, resp, next) => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      return resp
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { id } = user;

    User.getUserbyId(id, (err, userData) => {
      if (err) {
        console.error("Error fetching user:", err);
        return resp
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!userData) {
        return resp
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      resp.json({ success: true, user: userData });
    });
  } catch (error) {
    console.error("Error in sendRequest:", error);
    resp.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.postRequest = (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res
        .status(401)
        .json({ success: false, message: "User not logged in" });
    }

    const {
      collector_id,
      waste_type,
      quantity,
      pickup_address,
      pickup_lat,
      pickup_lng,
      preferred_date,
      preferred_time,
      notes,
    } = req.body;

    // Validation
    if (!waste_type || !quantity || !pickup_address) {
      return res.status(400).json({
        success: false,
        message: "Waste type, quantity, and pickup address are required",
      });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    const wasteRequest = new Waste(
      user_id,
      collector_id,
      waste_type,
      quantity,
      pickup_address,
      pickup_lat,
      pickup_lng,
      preferred_date,
      preferred_time,
      notes,
    );

    wasteRequest.save();

    res.json({
      success: true,
      redirectTo: "success.html",
      message: "Waste Pickup Request Sent Successfully!",
    });
  } catch (error) {
    console.error("Error in postRequest:", error);
    res
      .status(500)
      .json({ success: false, message: "Error creating waste request" });
  }
};

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.nearestCollector = (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

    conn.query(
      "SELECT * FROM collector WHERE latitude IS NOT NULL AND longitude IS NOT NULL",
      (err, results) => {
        if (err) {
          console.error("Database error fetching collectors:", err);
          return res
            .status(500)
            .json({ success: false, error: "Database error" });
        }

        if (!results || results.length === 0) {
          return res.json({ success: false, message: "No collectors found" });
        }

        let nearest = null;
        let minDistance = Infinity;

        results.forEach((collector) => {
          if (collector.latitude && collector.longitude) {
            const dist = getDistance(
              userLat,
              userLng,
              collector.latitude,
              collector.longitude,
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearest = collector;
            }
          }
        });

        if (nearest) {
          res.json({
            success: true,
            id: nearest.id,
            name: nearest.name,
            phone: nearest.phone_no,
            address: nearest.address,
            distance: minDistance.toFixed(2),
          });
        } else {
          res.json({ success: false, message: "No nearby collectors found" });
        }
      },
    );
  } catch (error) {
    console.error("Error in nearestCollector:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.rewards = (req, res) => {
  try {
    const user = req.user;
    console.log("inside rewards");
    if (!user || !user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { id } = user;

    User.getUserbyId(id, (err, userData) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!userData) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (userData.userType !== "user") {
        console.warn("Unauthorized access attempt - user type mismatch");
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
      }

      Rewards.getAllCoupons((err, coupons) => {
        if (err) {
          console.error("Error fetching coupons:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error fetching coupons" });
        }

        Rewards.getUserCoupons(id, (err, userCoupons) => {
          if (err) {
            console.error("Error fetching user coupons:", err);
            return res
              .status(500)
              .json({ success: false, message: "Error fetching user coupons" });
          }

          res.json({
            success: true,
            user: userData,
            coupons: coupons || [],
            userCoupons: userCoupons || [],
            message: [],
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in rewards:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.redeemCoupon = (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const userId = user.id;
    const couponId = req.body.coupon_id;

    if (!couponId) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon ID is required" });
    }

    Rewards.redeemCoupon(userId, couponId, (err) => {
      if (err) {
        const msg = err.message || "Error redeeming coupon";
        console.error("Redeem Error:", msg);

        Rewards.getAllCoupons((errCoupons, coupons) => {
          if (errCoupons) {
            console.error("Error fetching coupons:", errCoupons);
            return res
              .status(500)
              .json({ success: false, message: "Error fetching coupons" });
          }

          Rewards.getUserCoupons(userId, (errUserCoupons, userCoupons) => {
            if (errUserCoupons) {
              console.error("Error fetching user coupons:", errUserCoupons);
              return res.status(500).json({
                success: false,
                message: "Error fetching user coupons",
              });
            }

            return res.json({
              success: false,
              user: user,
              coupons: coupons || [],
              userCoupons: userCoupons || [],
              message: msg,
            });
          });
        });
        return;
      }

      res.json({ success: true, message: "Coupon redeemed successfully" });
    });
  } catch (error) {
    console.error("Error in redeemCoupon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.productPage = (req, res) => {
  const products = [
    {
      id: 1,
      name: "Bamboo Toothbrush",
      price: 99,
      description: "Biodegradable bamboo toothbrush.",
      image: "/images/products/bamboo_toothbrush.jpeg",
    },
    {
      id: 2,
      name: "Metal Straw Set",
      price: 149,
      description: "Reusable stainless-steel straws.",
      image: "/images/products/metal_straws.jpeg",
    },
    {
      id: 3,
      name: "Cloth Grocery Bag",
      price: 199,
      description: "100% cotton reusable bag.",
      image: "/images/products/cloth_bag.jpeg",
    },
    {
      id: 4,
      name: "Recycled Notepad",
      price: 129,
      description: "Notebook made from recycled paper.",
      image: "/images/products/notepad.jpeg",
    },
    {
      id: 5,
      name: "Organic Hand Soap",
      price: 159,
      description: "Natural and chemical-free soap.",
      image: "/images/products/organic_soap.jpeg",
    },
  ];

  res.json({ success: true, products });
};

exports.applyCoupon = (req, res) => {
  try {
    console.log("Apply Coupon Request Body:", req.body);
    const { product_id, price, coupon_code } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    if (!coupon_code || !price) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and price are required",
      });
    }

    const sql = `
      SELECT uc.*, c.discount 
      FROM user_coupons uc 
      JOIN coupons c ON uc.coupon_id = c.id
      WHERE uc.code = ? AND uc.user_id = ? AND uc.status = 'active'
    `;

    conn.query(sql, [coupon_code, userId], (err, result) => {
      if (err) {
        console.error("Database error applying coupon:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!result || result.length === 0) {
        return res.json({
          success: false,
          message: "Invalid or expired coupon",
        });
      }

      const discount = result[0].discount;
      const originalPrice = Number(price);

      if (isNaN(originalPrice) || originalPrice <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid price" });
      }

      const finalPrice = originalPrice - (originalPrice * discount) / 100;

      conn.query(
        "UPDATE user_coupons SET status='used' WHERE code = ?",
        [coupon_code],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating coupon status:", updateErr);
          }
        },
      );

      req.session.checkout = {
        originalPrice,
        discount,
        finalPrice,
      };

      res.json({
        success: true,
        product_id,
        originalPrice,
        discount,
        finalPrice,
      });
    });
  } catch (error) {
    console.error("Error in applyCoupon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.checkout = (req, res) => {
  try {
    const { productId, finalPrice, discount, originalPrice, amountSaved } =
      req.body;

    if (!productId || finalPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and final price are required",
      });
    }

    req.session.checkoutData = {
      productId,
      finalPrice,
      discount,
      originalPrice,
      amountSaved,
    };

    res.json({
      redirectTo: "/checkouts.html",
      success: true,
      productId,
      finalPrice,
      discount,
      originalPrice,
      amountSaved,
    });
  } catch (error) {
    console.error("Error in checkout:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.checkoutData = (req, res) => {
  try {
    console.log("Fetching checkout data for session:", req.sessionID);
    const checkoutData = req.session.checkoutData;

    if (!checkoutData) {
      return res.status(400).json({
        success: false,
        message: "No checkout data found. Please complete checkout first.",
      });
    }

    res.json({ success: true, checkoutData });
  } catch (error) {
    console.error("Error in checkoutData:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.userProfile = (req, res) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  if (userType === "user") {
    console.log("Fetching user profile for ID:", userId, userType);
    User.getUserbyId(userId, (err, user) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }
      console.log("Fetched user profile:", user);
      res.json({ success: true, user });
    });
  } else if (userType === "collector") {
    console.log("Fetching collector profile for ID:", userId, userType);
    Collector.getCollectorbyId(userId, (err, collector) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }
      console.log("Fetched collector profile:", collector);
      res.json({ success: true, user: collector });
    });
  } else if (userType === "admin") {
    console.log("Fetching admin profile for ID:", userId, userType);
    conn.query("SELECT * FROM admin WHERE id = ?", [userId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }
      if (result.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found" });
      }
      console.log("Fetched admin profile:", result[0]);
      res.json({ success: true, user: result[0] });
    });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user type" });
  }
};

exports.editProfile = (req, res) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;
  const { name, phone_no, address, city, state } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  // Validation
  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  if (userType === "user") {
    const sql =
      "UPDATE users SET name = ?, phone_no = ?, address = ? WHERE id = ?";
    conn.query(
      sql,
      [name, phone_no || null, address || null, userId],
      (err, result) => {
        if (err) {
          console.log("Error updating user profile:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }
        console.log("Profile updated successfully for user ID:", userId);
        res.json({ success: true, message: "Profile updated successfully" });
      },
    );
  } else if (userType === "collector") {
    const sql =
      "UPDATE collector SET name = ?, phone_no = ?, address = ?, city = ?, state = ? WHERE id = ?";
    conn.query(
      sql,
      [
        name,
        phone_no || null,
        address || null,
        city || null,
        state || null,
        userId,
      ],
      (err, result) => {
        if (err) {
          console.log("Error updating collector profile:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }
        console.log("Profile updated successfully for collector ID:", userId);
        res.json({ success: true, message: "Profile updated successfully" });
      },
    );
  } else if (userType === "admin") {
    const sql = "UPDATE admin SET name = ? WHERE id = ?";
    conn.query(sql, [name, userId], (err, result) => {
      if (err) {
        console.log("Error updating admin profile:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }
      console.log("Profile updated successfully for admin ID:", userId);
      res.json({ success: true, message: "Profile updated successfully" });
    });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user type" });
  }
};
