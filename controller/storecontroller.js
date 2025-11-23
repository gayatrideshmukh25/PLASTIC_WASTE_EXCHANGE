
const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Rewards = require('../Model/Rewards');
const conn  = require('../Utils/database');

exports.pendingTasks = (req, resp, next) => {
    const  user = req.session.user;
    const {id} = user;
     Collector.getCollectorbyId(id,(err,collector) => {
        if(collector.userType !== 'collector'){
            console.log("unauthorized access");
            return resp.redirect('/login');
        };
    Waste.getPendingWaste(id,(err,wasteLogged) => {
        if(err){
            console.log(err);
            return resp.status(500).send("Database error");
        }    
    resp.render('store/pendingTask',{user : collector,wasteLogged : wasteLogged})
    });
    });
}
exports.completedTasks =(req,resp,next) => {
       const  user = req.session.user;
    const {id} = user;
     Collector.getCollectorbyId(id,(err,collector) => {
        if(collector.userType !== 'collector'){
            console.log("unauthorized access");
            return resp.redirect('/login');
        };
    Waste.getCompletedWaste(id,(err,wasteLogged) => {
        if(err){
            console.log(err);
            return resp.status(500).send("Database error");
        }    
    resp.render('store/completedTasks',{user : collector,wasteLogged : wasteLogged})
    });
    });

}

exports.about = (req, resp, next) => {
    resp.render('store/about');
}

exports.contact = (req, resp, next) => {
    resp.render('store/contact');
}

exports.learnMore = (req, resp, next) => {
    resp.render('store/learnMore');
}
   
              