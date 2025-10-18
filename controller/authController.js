const conn = require('../Utils/database');
const bcrypt = require("bcrypt");
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Waste = require('../Model/plastic');
const { name } = require('ejs');
const {validationResult,check} = require('express-validator');


exports.login = (req,resp,next) => {
    resp.render('Auth/login',{errors: [],
        errorMessage: "",
        oldInput:'' });
}
exports.postlogin = [
    check("email").isEmail().withMessage("Enter a valid email"),
    check("password").notEmpty().withMessage("Password is required"),
  
  async (req,res,next) => {
      const errorsResult = validationResult(req);
    if (!errorsResult.isEmpty()) {
      return res.render("Auth/login", {
        errors: errorsResult.array(),
        errorMessage: "",
        oldInput: { email: req.body.email },
      });
    }

    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.render("Auth/login", {
        errors: [],
        errorMessage: "All fields are required",
        oldInput: { email },
      });
    }

    try {
      let userData;

      //  Fetch user by type
      if (userType === "user") {
        userData = await new Promise((resolve, reject) => {
          User.getUser(email, (err, user) => {
            if (err) return reject(err);
            resolve(user);
          });
        });
        console.log("found user : ",userData)
      } else if (userType === "collector") {
        userData = await new Promise((resolve, reject) => {
          Collector.getCollector(email, (err, collector) => {
            if (err) return reject(err);
            resolve(collector);
          });
        });
      } else if (userType === "admin") {
        userData = await new Promise((resolve, reject) => {
          conn.query("SELECT * FROM admin WHERE email = ?", [email], (err, result) => {
            if (err) return reject(err);
            resolve(result[0]);
          });
        });
      } else {
        return res.render("Auth/login", {
          errors: [],
          errorMessage: "Invalid user type",
          oldInput: { email },
        });
      }

      //  If user not found
      if (!userData) {
        return res.render("Auth/login", {
          errors: [],
          errorMessage: "Email or password incorrect",
          oldInput: { email },
        });
      }

    const match =  await bcrypt.compare(password,userData.password);
    if (!match) {
        // Password mismatch
        return res.render("Auth/login", {
          errors: [],
          errorMessage: "Email or password incorrect",
          oldInput: { email },
        });
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
    
}]
exports.signup = (req,resp,next) => {
    resp.render('Auth/signup',{
        errors : [],
        oldInput : {}
    });
}
exports.postsignup = [
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

      async (req, res, next) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      userType,
      address,
      phone_no,
      city,
      state,
      pincode,
      latitude,
       longitude,
      availablity,
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const mappedErrors = errors.mapped();
       

      console.log("Validation errors:", mappedErrors);

      return res.status(422).render("Auth/signup", {
        errors: mappedErrors,
        oldInput: {
          name,
          email,
          password,
          confirmPassword,
          address,
          phone_no,
          userType,
          city,
          state,
          pincode,
          availablity,
        },
      });
    }

    try {
      // ✅ hash after validation (better performance)
      const hashedPassword = await bcrypt.hash(password, 10);

      if (userType === "user") {
        const newUser = new User(name, email, hashedPassword, userType, address, phone_no);
        await newUser.save();
      } else if (userType === "collector") {
        const newCollector = new Collector(
          name,
          email,
          hashedPassword,
          userType,
          address,
          phone_no,
          city,
          state,
          pincode,
          latitude, 
          longitude,
          availablity
        );
        await newCollector.save();
      }

      // ✅ Always redirect after async operations complete
      return res.redirect("/login");
    } catch (err) {
      console.error("Signup Error:", err);
      return res.status(500).send("Internal Server Error");
    }
  },] ;

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