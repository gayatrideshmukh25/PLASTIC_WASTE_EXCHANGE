
const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const conn  = require('../Utils/database');


exports.home = (req,resp,next) => {
    resp.render('host/home');
}

exports.userDashboard = (req,resp,next) => {
      const  user = req.session.user;
      const {id} = user;
      User.getUserbyId(id,(err,user) => {
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
    const collector = req.session.user;
    const {id} = collector;
    Collector.getCollectorbyId(id,(err,collector) => {
        if(collector.userType !== 'collector'){
            console.log("unauthorized access");
            return resp.redirect('/login');
        }
    resp.render('host/collectorDashboard',{user : collector});
    });
}

exports.adminDashboard =(req,resp,next) => {
    console.log("Admin Dashboard accessed");
    const admin = req.session.user;
    const {userType} = admin;
    if(userType !== 'admin'){
            console.log("unauthorized access");
            return resp.redirect('/login');
        }
    resp.render('host/adminDashboard',{user : admin});
};

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
    const {id} = user;
    User.getUserbyId(id,(err,user) => {
    resp.render('host/sendWaste',{user : user});
    });
}