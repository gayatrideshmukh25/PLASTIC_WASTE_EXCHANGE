const conn = require('../Utils/database');
const crypto = require("crypto");
const User = require('../Model/Home');
const Waste = require('../Model/plastic');

exports.login = (req,resp,next) => {
    resp.render('Auth/login');
}
exports.postlogin = (req,resp,next) => {
    const {email,password} = req.body;
    User.getUser(email,(err,user) => {
        if (err) {
        console.error("Database error:", err);
        return;
    }
    if (!user) {
        console.log("User not found");
        return;
    }
    if(user.password !== password){
         console.log('invalid password');
         return;
    }
    req.session.user = {id: user.id, email: user.email, userType: user.userType};

           req.session.save((err) => {
            if(err){
                console.log("Error saving session",err);
                return;
            }
         if(user.userType === 'user'){
              return resp.redirect('/userDashboard');
        } else if(user.userType === 'admin'){
              return resp.redirect('/adminDashboard');
         } else if(user.userType === 'collector'){
              return resp.redirect('/collectorDashboard');
         } else {
              return  console.log("invalid user");
        }
        })
     });
  
}
exports.signup = (req,resp,next) => {
    resp.render('Auth/signup');
}
exports.postsignup = (req,resp,next) => {
    console.log(req.body);
    const {fullname,email,password,userType,address,phone_no} = req.body;
     const newUser = new User(fullname,email,password,userType,address,phone_no);
     newUser.save();
     resp.redirect('/login');
    
}
exports.logout = (req,resp,next) => {
    req.session.destroy((err) => {
        if(err){
            console.log("Error destroying session",err);
            return;
        }
        resp.clearCookie('session_cookie_name');
        resp.redirect('/login');
    }
    )
}