const express = require("express");
const adminRouter = express.Router();
const jwt = require("jsonwebtoken");

const {
  adminDashboard,
  Users,
  Collectors,
  addCoupons,
  getCoupons,
  deleteCoupons,
} = require("../controller/adminController");
const { editProfile, userProfile } = require("../controller/userController");
const { verifyToken } = require("../middleware/auth");

function isAuthenticated(req, res, next) {
  if (req.cookies && req.cookies.token) {
    return next();
  }
  res.redirect("/login");
}

adminRouter.get(
  "/adminDashboard",
  verifyToken,
  isAuthenticated,
  adminDashboard,
);
adminRouter.get("/admin/users", verifyToken, Users);
adminRouter.get("/admin/collectors", verifyToken, Collectors);
adminRouter.post("/admin/rewards/add", verifyToken, addCoupons);
adminRouter.post("/admin/rewards/delete", verifyToken, deleteCoupons);
adminRouter.get("/admin/getCoupons", verifyToken, getCoupons);
adminRouter.get("/getUserProfile", isAuthenticated, userProfile);
adminRouter.post("/editProfile", isAuthenticated, editProfile);

module.exports = adminRouter;
