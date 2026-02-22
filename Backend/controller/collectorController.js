const Waste = require("../Model/plastic");
const User = require("../Model/Home");
const Collector = require("../Model/Collector");

exports.collectorDashboard = (req, res, next) => {
  try {
    const collector = req.user;

    if (!collector || !collector.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const id = collector.id;

    Collector.getCollectorbyId(id, (err, collectorData) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error while fetching collector data",
        });
      }

      if (!collectorData) {
        console.warn("Collector not found for ID:", id);
        return res.status(404).json({
          success: false,
          message: "Collector not found",
        });
      }

      if (collectorData.userType !== "collector") {
        console.warn("Unauthorized access attempt - user type mismatch");
        return res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      Waste.getAllWaste(id, (err, wasteLogged) => {
        if (err) {
          console.error("Waste fetch error:", err);
          return res.status(500).json({
            success: false,
            message: "Database error while fetching waste requests",
          });
        }

        return res.json({
          success: true,
          user: collectorData,
          wasteLogged: wasteLogged || [],
        });
      });
    });
  } catch (error) {
    console.error("Error in collectorDashboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.pendingTasks = (req, resp, next) => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      return resp
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { id } = user;

    Collector.getCollectorbyId(id, (err, collector) => {
      if (err) {
        console.error("Error fetching collector:", err);
        return resp
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!collector) {
        return resp
          .status(404)
          .json({ success: false, message: "Collector not found" });
      }

      if (collector.userType !== "collector") {
        console.warn("Unauthorized access attempt - user type mismatch");
        return resp
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
      }

      Waste.getPendingWaste(id, (err, wasteLogged) => {
        if (err) {
          console.error("Error fetching pending waste:", err);
          return resp
            .status(500)
            .json({ success: false, message: "Database error" });
        }

        resp.json({
          success: true,
          user: collector,
          wasteLogged: wasteLogged || [],
        });
      });
    });
  } catch (error) {
    console.error("Error in pendingTasks:", error);
    resp.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.completedTasks = (req, resp, next) => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      return resp
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { id } = user;

    Collector.getCollectorbyId(id, (err, collector) => {
      if (err) {
        console.error("Error fetching collector:", err);
        return resp
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!collector) {
        return resp
          .status(404)
          .json({ success: false, message: "Collector not found" });
      }

      if (collector.userType !== "collector") {
        console.warn("Unauthorized access attempt - user type mismatch");
        return resp
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
      }

      Waste.getCompletedWaste(id, (err, wasteLogged) => {
        if (err) {
          console.error("Error fetching completed waste:", err);
          return resp
            .status(500)
            .json({ success: false, message: "Database error" });
        }

        resp.json({
          success: true,
          user: collector,
          wasteLogged: wasteLogged || [],
        });
      });
    });
  } catch (error) {
    console.error("Error in completedTasks:", error);
    resp.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.completeRequest = (req, res) => {
  try {
    const collector = req.user;

    if (!collector || !collector.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const collectorId = collector.id;
    const id = req.params.request_id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Request ID is required" });
    }

    console.log("Completing request ID:", id);

    Waste.getWasteById(id, (err, waste) => {
      if (err) {
        console.error("Error fetching waste request:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!waste) {
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });
      }

      Waste.updateStatus(id, "completed", (err, result) => {
        if (err) {
          console.error("Error updating status:", err);
          return res.status(500).json({
            success: false,
            message: "Database error while updating status",
          });
        }

        function calculatePoints(waste_type, quantity) {
          let baseRate;
          switch (waste_type) {
            case "dry":
              baseRate = 10;
              break;
            case "wet":
              baseRate = 8;
              break;
            case "e-waste":
              baseRate = 12;
              break;
            case "hazardous":
              baseRate = 9;
              break;
            case "bulk":
              baseRate = 7;
              break;
            default:
              baseRate = 5;
          }
          return Math.round(quantity * baseRate);
        }

        const points = calculatePoints(waste.waste_type, waste.quantity);

        User.add_points(waste.user_id, points, (err, updateResult) => {
          if (err) {
            console.error("Error adding points:", err);
            // Don't fail the request, points addition is secondary
          } else {
            console.log("Points added successfully:", points);
          }

          res.json({
            success: true,
            message: "Request completed successfully",
            redirectTo: "/collectorDashboard.html",
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in completeRequest:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.acceptRequest = (req, res) => {
  try {
    const id = req.params.request_id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Request ID is required" });
    }

    Waste.updateStatus(id, "accepted", (err, result) => {
      if (err) {
        console.error("Error updating status:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      res.json({
        success: true,
        message: "Request accepted successfully",
        redirectTo: "/collectorDashboard.html",
      });
    });
  } catch (error) {
    console.error("Error in acceptRequest:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.rejectRequest = (req, res) => {
  try {
    const id = req.params.request_id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Request ID is required" });
    }

    Waste.updateStatus(id, "cancelled", (err) => {
      if (err) {
        console.error("Error updating status:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      res.json({
        success: true,
        message: "Request rejected successfully",
        redirectTo: "/collectorDashboard.html",
      });
    });
  } catch (error) {
    console.error("Error in rejectRequest:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
