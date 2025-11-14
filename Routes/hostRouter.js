const express = require('express');
const hostRouter = express.Router();

const { postrequest,home,userDashboard,collectorDashboard,adminDashboard,sendRequest,nearestCollector,postRequest,acceptRequest,rejectRequest,completeRequest,rewards,redeemCoupon } = require('../controller/hostController');
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); 
}

hostRouter.get('/',home);
hostRouter.get('/userDashboard',isAuthenticated,userDashboard);

hostRouter.get('/collectorDashboard',isAuthenticated,collectorDashboard);
hostRouter.get('/adminDashboard',isAuthenticated,adminDashboard);

hostRouter.get('/userDashboard/sendRequest',isAuthenticated,sendRequest);
hostRouter.get('/userDashboard/nearestCollector',isAuthenticated,nearestCollector);
hostRouter.post('/userDashboard/postRequest',isAuthenticated,postRequest);
hostRouter.get('/userDashboard/rewards',isAuthenticated,rewards);
hostRouter.post('/userDashboard/rewards/redeem', isAuthenticated,redeemCoupon );

hostRouter.get('/collectorDashboard/accept/:request_id', isAuthenticated,acceptRequest);
hostRouter.get('/collectorDashboard/reject/:request_id', isAuthenticated,rejectRequest);
hostRouter.get('/collectorDashboard/complete/:request_id',isAuthenticated, completeRequest);

   


module.exports = hostRouter;