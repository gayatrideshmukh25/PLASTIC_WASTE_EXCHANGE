const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");

const {
  checkoutData,
  checkout,
  userDashboard,
  sendRequest,
  nearestCollector,
  postRequest,
  rewards,
  redeemCoupon,
  applyCoupon,
  productPage,
  userProfile,
  editProfile,
} = require("../controller/userController");
const authenticateJWT = (req, res, next) => {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
  console.log("Received token:", token); // Debug log
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to req
    console.log("Decoded JWT:", decoded); // Debug log
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

userRouter.get(
  "/userDashboard",
  authenticateJWT,
  isAuthenticated,
  userDashboard,
);
userRouter.get(
  "/userDashboard/sendRequest",
  authenticateJWT,
  isAuthenticated,
  sendRequest,
);
userRouter.get(
  "/userDashboard/nearestCollector",
  authenticateJWT,
  isAuthenticated,
  nearestCollector,
);
userRouter.post("/userDashboard/postRequest", authenticateJWT, postRequest);
userRouter.get(
  "/userDashboard/rewards",
  authenticateJWT,
  isAuthenticated,
  rewards,
);
userRouter.post(
  "/userDashboard/rewards/redeem",
  authenticateJWT,
  isAuthenticated,
  redeemCoupon,
);
userRouter.post("/userDashboard/apply-coupon", authenticateJWT, applyCoupon);
userRouter.get("/products", authenticateJWT, isAuthenticated, productPage);
userRouter.post("/checkout", checkout);
userRouter.get("/checkout/data", authenticateJWT, checkoutData);
userRouter.get("/getUserProfile", authenticateJWT, userProfile);
userRouter.post("/editProfile", authenticateJWT, isAuthenticated, editProfile);
// userRouter.get("/editProfile", editProfile);
// userRouter.post("/editProfile/:id", postEditProfile);

module.exports = userRouter;
