const express = require('express');
const storeRouter = express.Router();

storeRouter.get('/',(req,resp,next) => {
    resp.render('host/home');
});

module.exports = storeRouter;