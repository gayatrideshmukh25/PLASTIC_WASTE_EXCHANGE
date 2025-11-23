const express = require('express');
const storeRouter = express.Router();
const { pendingTasks,completedTasks,about,contact,learnMore } = require('../controller/storecontroller');

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); 
}


storeRouter.get('/collectorDashboard/pendingTasks',isAuthenticated,pendingTasks);
storeRouter.get('/collectorDashboard/completedTasks',isAuthenticated,completedTasks);
storeRouter.get('/about',about);
storeRouter.get('/contact',contact);
storeRouter.get('/learnMore',learnMore);


module.exports = storeRouter;