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

adminRouter.get(
  "/adminDashboard",
  authenticateJWT,
  isAuthenticated,
  adminDashboard,
);
adminRouter.get("/admin/users", authenticateJWT, Users);
adminRouter.get("/admin/collectors", authenticateJWT, Collectors);
adminRouter.post("/admin/rewards/add", authenticateJWT, addCoupons);
adminRouter.post("/admin/rewards/delete", authenticateJWT, deleteCoupons);
adminRouter.get("/admin/getCoupons", authenticateJWT, getCoupons);
adminRouter.get("/getUserProfile", isAuthenticated, userProfile);
adminRouter.post("/editProfile", isAuthenticated, editProfile);

module.exports = adminRouter;
