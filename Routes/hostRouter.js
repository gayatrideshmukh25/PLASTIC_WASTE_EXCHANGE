const express = require('express');
const hostRouter = express.Router();

const { home,userDashboard,collectorDashboard,adminDashboard,sendRequest,nearestCollector,postRequest,acceptRequest,rejectRequest,completeRequest,rewards,redeemCoupon,Users,Collectors, applyCoupon, productPage } = require('../controller/hostController');
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); 
}

hostRouter.get('/',home);

hostRouter.get('/userDashboard',isAuthenticated,userDashboard);
hostRouter.get('/userDashboard/sendRequest',isAuthenticated,sendRequest);
hostRouter.get('/userDashboard/nearestCollector',isAuthenticated,nearestCollector);
hostRouter.post('/userDashboard/postRequest',isAuthenticated,postRequest);
hostRouter.get('/userDashboard/rewards',isAuthenticated,rewards);
hostRouter.post('/userDashboard/rewards/redeem', isAuthenticated,redeemCoupon );
hostRouter.post('/userDashboard/apply-coupon',isAuthenticated,applyCoupon);
hostRouter.post('/products',isAuthenticated,productPage);

hostRouter.get('/collectorDashboard',isAuthenticated,collectorDashboard);
hostRouter.get('/collectorDashboard/accept/:request_id', isAuthenticated,acceptRequest);
hostRouter.get('/collectorDashboard/reject/:request_id', isAuthenticated,rejectRequest);
hostRouter.get('/collectorDashboard/complete/:request_id',isAuthenticated, completeRequest);

hostRouter.get('/adminDashboard',isAuthenticated,adminDashboard);
hostRouter.get('/admin/users',Users);
hostRouter.get('/admin/collectors',Collectors);

   


module.exports = hostRouter;