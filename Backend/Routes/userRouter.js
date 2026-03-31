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
const { verifyToken } = require("../middleware/auth");

function isAuthenticated(req, res, next) {
  if (req.cookies && req.cookies.token) {
    return next();
  }
  res.redirect("/login");
}

userRouter.get("/userDashboard", verifyToken, isAuthenticated, userDashboard);
userRouter.get(
  "/userDashboard/sendRequest",
  verifyToken,
  isAuthenticated,
  sendRequest,
);
userRouter.get(
  "/userDashboard/nearestCollector",
  verifyToken,
  isAuthenticated,
  nearestCollector,
);
userRouter.post("/userDashboard/postRequest", verifyToken, postRequest);
userRouter.get("/userDashboard/rewards", verifyToken, isAuthenticated, rewards);
userRouter.post(
  "/userDashboard/rewards/redeem",
  verifyToken,
  isAuthenticated,
  redeemCoupon,
);
userRouter.post("/userDashboard/apply-coupon", verifyToken, applyCoupon);
userRouter.get("/products", verifyToken, isAuthenticated, productPage);
userRouter.post("/checkout", checkout);
userRouter.get("/checkout/data", verifyToken, checkoutData);
userRouter.get("/getUserProfile", verifyToken, userProfile);
userRouter.post("/editProfile", verifyToken, isAuthenticated, editProfile);
// userRouter.get("/editProfile", editProfile);
// userRouter.post("/editProfile/:id", postEditProfile);

module.exports = userRouter;
