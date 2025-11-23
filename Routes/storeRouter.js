const express = require('express');
const storeRouter = express.Router();
const {home,about,contact,learnMore } = require('../controller/storecontroller');


storeRouter.get('/',home);
storeRouter.get('/about',about);
storeRouter.get('/contact',contact);
storeRouter.get('/learnMore',learnMore);


module.exports = storeRouter;