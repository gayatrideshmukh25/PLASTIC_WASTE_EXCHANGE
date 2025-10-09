const  getSession  = require('../Utils/session');
const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const conn  = require('../Utils/database');

exports.home = (req,resp,next) => {
    resp.render('host/home');
}

exports.userDashboard = (req,resp,next) => {
      const  user = req.session.user;
      const {id,email} = user;
      User.getUser(email,(err,user) => {
      Waste.getAllWaste(id,(wasteLogged) => {
      req.session.waste = wasteLogged;
      req.session.save((err) => {
        if(err){
            console.log("Error saving session",err);
            return;
        }
        });
         resp.render('host/userDashboard',{user : user,wasteLogged : wasteLogged})
      });
    });
}

exports.collectorDashboard = (req,resp,next) => {
    const id = req.session.user.id;
    User.getUserbyId(id,(err,user) => {
        if(user.userType !== 'collector'){
            console.log("unauthorized access");
            return resp.redirect('/login');
        }
    resp.render('host/collectorDashboard',{user : user});
    });
}

exports.adminDashboard =(req,resp,next) => {
    const id = req.session.user.id;
    User.getUserbyId(id,(err,user) => {
        if(user.userType !== 'admin'){
            console.log("unauthorized access");
            return resp.redirect('/login');
        }
    resp.render('host/adminDashboard',{user : user});
});
}
exports.logwaste = (req,resp,next) => {
    const id = req.session.user.id;
    resp.render('host/logwaste',{id : id});
}

exports.postrequest = (req,resp,next) => {
    const {id,wasteType,quantity} = req.body;
    const waste = new Waste(id,wasteType,quantity);
    waste.save();
    resp.redirect('/userDashboard');
     }

exports.profile = (req,resp,next) => {
    console.log("Profile");
}
exports.sendRequest = (req,resp,next) => {
    const user = req.session.user;
    resp.render('host/sendWaste',{user : user});
}