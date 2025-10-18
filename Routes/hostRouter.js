const express = require('express');
const hostRouter = express.Router();

const { postrequest,home,userDashboard,collectorDashboard,adminDashboard,logwaste,profile,sendRequest,nearestCollector } = require('../controller/hostController');
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
hostRouter.get('/logwaste',isAuthenticated,logwaste)
hostRouter.post('/postrequest',isAuthenticated,postrequest);
hostRouter.get('/sendRequest',isAuthenticated,sendRequest);
hostRouter.get('/nearestCollector',isAuthenticated,nearestCollector);

   


module.exports = hostRouter;