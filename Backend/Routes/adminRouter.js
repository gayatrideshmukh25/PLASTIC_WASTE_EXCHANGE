const express = require('express');
const adminRouter = express.Router();

const { adminDashboard,Users,Collectors } = require('../controller/adminController');
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); 
}

adminRouter.get('/api/adminDashboard',isAuthenticated,adminDashboard);
adminRouter.get('/api/admin/users',Users);
adminRouter.get('/api/admin/collectors',Collectors);

module.exports = adminRouter;