const conn = require('../Utils/database');
const crypto = require("crypto");
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Waste = require('../Model/plastic');
const { name } = require('ejs');

exports.login = (req,resp,next) => {
    resp.render('Auth/login');
}
exports.postlogin = (req,res,next) => {
    const {email,password,userType} = req.body;
    if(!email || !password || !userType){
        console.log("All fields are required");
        return;
    }
    if(userType == 'user'){
    User.getUser(email,(err,user) => {
        if (err) {
        console.error("Database error:", err);
        return;
    }else if (!user) {
        console.log("User not found");
        return;
    }else if(user.password !== password){
         console.log('invalid password');
         return;
    } else
    req.session.user = {id: user.id, userType: user.userType};

           req.session.save((err) => {
            if(err){
                console.log("Error saving session",err);
                return;
            }
        return res.redirect('/userDashboard');
        })
      });
    } else if(userType == 'collector'){
        Collector.getCollector(email,(err,collector) => {
        if (err) {
        console.error("Database error:", err);
        return;
        } else if (!collector) {
        console.log("User not found");
        return;
        } else if(collector.password !== password){
         console.log('invalid password');
         return;
        } else 
        req.session.user = {id: collector.id, userType: collector.userType};

           req.session.save((err) => {
            if(err){
                console.log("Error saving session",err);
                return;
            }
            return res.redirect('/collectorDashboard');  
         })
       });
     } else if(userType == 'admin'){ 
       
        conn.query('select * from admin where email = ?',[email],(err,result) => {
        if(err){
            console.log("Database error:",err);
            return res.status(500).send("Database error");;
        } else if(result.length === 0){
            console.log("Admin not found");
            return res.status(404).send("Admin not found");;
        }
         const admin = result[0];
         if(admin.password !== password){
            console.log("Invalid password");
            return  res.status(401).send("Invalid password");;
         } else {
         console.log("Admin found:",admin);
         const {id,name,email,userType} = admin;
         console.log("Admin details:",id,name,email,userType);
         req.session.user = {id: id,name: name,email:email, userType: userType};   
         req.session.save((err)=>{
         if(err){
            console.log("Error saving session",err);
            return res.status(500).send("Database error");;
         } 
         console.log("Admin logged in successfully");
         return res.redirect('/adminDashboard'); 
        
      })    
       }  }); 
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