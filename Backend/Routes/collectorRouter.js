const express = require("express");
const collectorRouter = express.Router();

const {
  collectorDashboard,
  acceptRequest,
  rejectRequest,
  completeRequest,
  pendingTasks,
  completedTasks,
} = require("../controller/collectorController");

const { editProfile, userProfile } = require("../controller/userController");

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login");
}

collectorRouter.get("/collectorDashboard", isAuthenticated, collectorDashboard);
collectorRouter.get(
  "/collectorDashboard/pendingTasks",
  isAuthenticated,
  pendingTasks,
);
collectorRouter.get(
  "/collectorDashboard/completedTasks",
  isAuthenticated,
  completedTasks,
);
collectorRouter.get(
  "/collectorDashboard/accept/:request_id",
  isAuthenticated,
  acceptRequest,
);
collectorRouter.get(
  "/collectorDashboard/reject/:request_id",
  isAuthenticated,
  rejectRequest,
);
collectorRouter.get(
  "/collectorDashboard/complete/:request_id",
  isAuthenticated,
  completeRequest,
);
collectorRouter.get("/getUserProfile", isAuthenticated, userProfile);
collectorRouter.post("/editProfile", isAuthenticated, editProfile);

module.exports = collectorRouter;
