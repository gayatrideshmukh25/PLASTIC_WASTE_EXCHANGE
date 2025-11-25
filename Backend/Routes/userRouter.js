const express = require('express');
const userRouter = express.Router();

const {checkoutData,checkout,userDashboard,sendRequest,nearestCollector,postRequest,rewards,redeemCoupon, applyCoupon, productPage } = require('../controller/userController');
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); 
}



userRouter.get('/api/userDashboard',isAuthenticated,userDashboard);
userRouter.get('/api/userDashboard/sendRequest',isAuthenticated,sendRequest);
userRouter.get('/api/userDashboard/nearestCollector',isAuthenticated,nearestCollector);
userRouter.post('/api/userDashboard/postRequest',isAuthenticated,postRequest);
userRouter.get('/api/userDashboard/rewards',isAuthenticated,rewards);
userRouter.post('/api/userDashboard/rewards/redeem', isAuthenticated,redeemCoupon );
userRouter.post('/api/userDashboard/apply-coupon',applyCoupon);
userRouter.get('/api/products',isAuthenticated,productPage);
userRouter.post('/api/checkout',checkout)
userRouter.get('/api/checkout/data',checkoutData)



module.exports = userRouter;