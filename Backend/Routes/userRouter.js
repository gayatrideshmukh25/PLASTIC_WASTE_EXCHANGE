const express = require('express');
const userRouter = express.Router();

const {checkoutData,checkout,userDashboard,sendRequest,nearestCollector,postRequest,rewards,redeemCoupon, applyCoupon, productPage } = require('../controller/userController');
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); 
}



userRouter.get('/userDashboard',isAuthenticated,userDashboard);
userRouter.get('/userDashboard/sendRequest',isAuthenticated,sendRequest);
userRouter.get('/userDashboard/nearestCollector',isAuthenticated,nearestCollector);
userRouter.post('/userDashboard/postRequest',isAuthenticated,postRequest);
userRouter.get('/userDashboard/rewards',isAuthenticated,rewards);
userRouter.post('/userDashboard/rewards/redeem', isAuthenticated,redeemCoupon );
userRouter.post('/userDashboard/apply-coupon',applyCoupon);
userRouter.get('/products',isAuthenticated,productPage);
userRouter.post('/checkout',checkout)
userRouter.get('/checkout/data',checkoutData)



module.exports = userRouter;