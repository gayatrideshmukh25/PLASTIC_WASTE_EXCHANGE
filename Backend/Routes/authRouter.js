const express = require('express');
const authRouter = express.Router();
const { postlogin,postsignup,logout} =  require('../controller/authController')


authRouter.post('/login',postlogin)
authRouter.post('/signup',postsignup)
authRouter.get('/logout',logout)

module.exports = authRouter;