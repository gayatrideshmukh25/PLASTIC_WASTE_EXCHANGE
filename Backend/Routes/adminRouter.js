const express = require('express');
const adminRouter = express.Router();

const { adminDashboard,Users,Collectors,addCoupons , getCoupons,deleteCoupons} = require('../controller/adminController');
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); 
}

adminRouter.get('/adminDashboard',isAuthenticated,adminDashboard);
adminRouter.get('/admin/users',Users);
adminRouter.get('/admin/collectors',Collectors);
adminRouter.post('/admin/rewards/add',addCoupons);
adminRouter.post('/admin/rewards/delete',deleteCoupons);
adminRouter.get('/admin/getCoupons',getCoupons);

module.exports = adminRouter;