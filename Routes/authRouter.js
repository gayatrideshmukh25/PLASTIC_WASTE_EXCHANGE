const express = require('express');
const authRouter = express.Router();
const {login, postlogin, signup,postsignup,logout} =  require('../controller/authController')

authRouter.get('/login',login)
authRouter.post('/postlogin',postlogin)
authRouter.get('/signup',signup)
authRouter.post('/postsignup',postsignup)
authRouter.get('/logout',logout)

module.exports = authRouter;