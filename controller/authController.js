const conn = require('../Utils/database');
const bcrypt = require("bcrypt");
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Waste = require('../Model/plastic');
const { name } = require('ejs');
const {validationResult,check} = require('express-validator');


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
    const match = bcrypt.compare(password,userData.password);
    if (!match) {
        res.status(400).send("Incorrect password or email");
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
    resp.render('Auth/signup',{
        errors : [],
        oldInput : {}
    });
}
exports.postsignup =[
    check('name')
    .trim()
    .isLength({min:3})
    .withMessage('Name must be at least 3 charactor long'),

    check('email')
    .isEmail()
    .withMessage('Please enter valid email address'),

    check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain a special character')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
     
     check('confirmPassword')
    .custom((value,{req}) => {
        if(value !== req.body.password){
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    check('userType')
      .notEmpty().withMessage('User type is required')
      .isIn(['user', 'collector', 'admin']).withMessage('Invalid user type'),

    check('phone')
      .optional()
      .isMobilePhone().withMessage('Invalid phone number'),

    check('city')
    .if((value, { req }) => req.body.userType === 'collector')
    .notEmpty()
    .withMessage('City is required for collector'),

  check('state')
    .if((value, { req }) => req.body.userType === 'collector')
    .notEmpty()
    .withMessage('State is required for collector'),

  check('pincode')
    .if((value, { req }) => req.body.userType === 'collector')
    .isPostalCode('IN')
    .withMessage('Invalid pincode'),

  check('availablity')
    .if((value, { req }) => req.body.userType === 'collector')
    .notEmpty()
    .withMessage('Availability is required'),

      async(req,resp,next) => {
      const {name,email,password,confirmPassword,userType,address,phone_no,city,state,pincode,availablity} = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const errors = validationResult(req);
      if(!errors.isEmpty()){
            console.log(errors.array());
            return resp.status(422).render('Auth/signup',{
            errors : errors.array(),
            oldInput:{
                name,email,password,confirmPassword,address,phone_no,userType,city,state,pincode,availablity

            }
            
        });
    }
     
      if(userType === 'user'){
        const newUser = new User(name,email,hashedPassword,userType,address,phone_no);
        newUser.save();
        resp.redirect('/login');
      } else if(userType === 'collector'){
        const newCollector = new Collector(name,email,hashedPassword,userType,address,phone_no,city,state,pincode,availablity);
        newCollector.save();
        resp.redirect('/login');
     } 
    
}] 

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