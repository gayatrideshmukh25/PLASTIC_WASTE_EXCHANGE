const express = require("express");
const collectorRouter = express.Router();
const jwt = require("jsonwebtoken");

const {
  collectorDashboard,
  acceptRequest,
  rejectRequest,
  completeRequest,
  pendingTasks,
  completedTasks,
} = require("../controller/collectorController");

const { editProfile, userProfile } = require("../controller/userController");
const { verifyToken } = require("../middleware/auth");

function isAuthenticated(req, res, next) {
  if (req.cookies && req.cookies.token) {
    return next();
  }
  res.redirect("/login");
}

collectorRouter.get(
  "/collectorDashboard",
  verifyToken,
  isAuthenticated,
  collectorDashboard,
);
collectorRouter.get(
  "/collectorDashboard/pendingTasks",
  verifyToken,
  isAuthenticated,
  pendingTasks,
);
collectorRouter.get(
  "/collectorDashboard/completedTasks",
  verifyToken,
  isAuthenticated,
  completedTasks,
);
collectorRouter.get(
  "/collectorDashboard/accept/:request_id",
  verifyToken,
  isAuthenticated,
  acceptRequest,
);
collectorRouter.get(
  "/collectorDashboard/reject/:request_id",
  verifyToken,
  isAuthenticated,
  rejectRequest,
);
collectorRouter.get(
  "/collectorDashboard/complete/:request_id",
  verifyToken,
  completeRequest,
);
collectorRouter.get(
  "/getUserProfile",
  verifyToken,
  isAuthenticated,
  userProfile,
);
collectorRouter.post("/editProfile", verifyToken, isAuthenticated, editProfile);

module.exports = collectorRouter;
