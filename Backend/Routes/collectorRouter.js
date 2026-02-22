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

const authenticateJWT = (req, res, next) => {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to req
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

function isAuthenticated(req, res, next) {
  if (req.cookies && req.cookies.token) {
    return next();
  }
  res.redirect("/login");
}

collectorRouter.get(
  "/collectorDashboard",
  authenticateJWT,
  isAuthenticated,
  collectorDashboard,
);
collectorRouter.get(
  "/collectorDashboard/pendingTasks",
  authenticateJWT,
  isAuthenticated,
  pendingTasks,
);
collectorRouter.get(
  "/collectorDashboard/completedTasks",
  authenticateJWT,
  isAuthenticated,
  completedTasks,
);
collectorRouter.get(
  "/collectorDashboard/accept/:request_id",
  authenticateJWT,
  isAuthenticated,
  acceptRequest,
);
collectorRouter.get(
  "/collectorDashboard/reject/:request_id",
  authenticateJWT,
  isAuthenticated,
  rejectRequest,
);
collectorRouter.get(
  "/collectorDashboard/complete/:request_id",
  authenticateJWT,
  completeRequest,
);
collectorRouter.get(
  "/getUserProfile",
  authenticateJWT,
  isAuthenticated,
  userProfile,
);
collectorRouter.post(
  "/editProfile",
  authenticateJWT,
  isAuthenticated,
  editProfile,
);

module.exports = collectorRouter;
