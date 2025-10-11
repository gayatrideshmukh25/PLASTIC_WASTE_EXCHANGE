const conn = require('../Utils/database');
const crypto = require("crypto");
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Waste = require('../Model/plastic');
const { name } = require('ejs');
const {validationResults,check} = require('express-validator');
const { rejects } = require('assert');

exports.login = (req,resp,next) => {
    resp.render('Auth/login');
}
exports.postlogin =async (req,res,next) => {
    const {email,password,userType} = req.body;
    
    if(!email || !password || !userType){
        return res.status(400).send("All fields are required");
    }
    try {
    let userData;
    if( userType == 'user'){
     userData = await new Promise ((resolve,reject) => {
         User.getUser(email,(err,user) => {
        if (err) {
            console.error("database error : ",err);
            reject(err);
        } else {
            resolve(user);
        }
     })
    })} else if(userType == 'collector'){
      userData = await new Promise((resolve,reject) => {
        Collector.getCollector(email,(err,collector) => {
        if (err) {
        console.error("Database error:", err);
        reject(err);
        } else {
           resolve(collector);
        }
      }) 
    })} else if(userType == 'admin'){ 
       
       userData = await new Promise((resolve,reject) => {
        conn.query('select * from admin where email = ?',[email],(err,result) => {
        if(err){
            console.log("Database error:",err);
            reject(err);
        }else{
            resolve(result[0]);
        }
       }) 
    })} else {
        return res.status(400).send("Invalid user type");
    } if(!userData){
        console.log("userData",userData);
         return res.status(404).send(`${userType} not found`);
    }  
     if(password !== userData.password){
        console.error("Invalid Email or password")
     }
    req.session.user = {id: userData.id, userType: userData.userType};
        req.session.save((err) => {
            if(err){
                console.log("Error saving session",err);
                 return res.status(500).send("Error saving session");
            }
       
            if(userType == 'user'){
                 return res.redirect('/userDashboard');
            }
            if(userType == 'collector'){
                 return res.redirect('/collectorDashboard');
            }
            if(userType == 'admin'){
                 return res.redirect('/adminDashboard');
            }
      });
    }   catch(error){
        console.error("Login error:", error);
        return res.status(500).send("Internal server error");
    }
    
}   
exports.signup = (req,resp,next) => {
    resp.render('Auth/signup');
}
exports.postsignup = (req,resp,next) => {
    console.log(req.body);
    const {fullname,email,password,userType,address,phone_no,city,state,pincode,availablity} = req.body;
    if(userType === 'user'){
        const newUser = new User(fullname,email,password,userType,address,phone_no);
        newUser.save();
        resp.redirect('/login');
    } else if(userType === 'collector'){
        const newCollector = new Collector(fullname,email,password,userType,address,phone_no,city,state,pincode,availablity);
        newCollector.save();
        resp.redirect('/login');
    } 
    
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