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

exports.completeRequest = (req,res) => {
    const id = req.params.request_id;
    console.log("Completing request ID:", id);
    Waste.getWasteById(id, (err, waste) => {
      if (err) {
        console.log("Error fetching waste by ID:", err);
        return res.status(500).send("Database error");
      }
      if (!waste) {
        console.log("No waste request found with ID:", id);
        return res.status(404).send("Request not found");
      }
     Waste.updateStatus(id, 'completed', (err, result) => {
      if (err) {
        console.log("Error updating status:", err);
        return res.status(500).send("Database error");
      } else {
      function calculatePoints(waste_type,quantity){
        let baseRate ;
        switch(waste_type){
           case 'dry' : baseRate = 10; break;
           case 'wet' : baseRate = 8; break;
           case 'e-waste' : baseRate = 12; break;
           case 'hazardous' : baseRate = 9; break;
           case 'bulk' : baseRate = 7; break;
           default : baseRate = 5;
        }
         return Math.round(quantity * baseRate);
      }
      const points = calculatePoints(waste.waste_type, waste.quantity);
      User.add_points(waste.user_id,points,(err,updateResult) => {
        if(err){
            console.log("Error adding points:", err);
        } else {
            console.log("Points added successfully:", updateResult);
        }
      
      res.redirect('/collectorDashboard');
      });
    }});
    });
}
exports.acceptRequest = (req,res) => {
    const id = req.params.request_id;
    Waste.updateStatus(id, 'accepted', (err, result) => {
     if (err) {
        console.log("Error updating status:", err);
        return res.status(500).send("Database error");
      }
      res.redirect('/collectorDashboard');
    });
}
exports.rejectRequest = (req, res) => {
  const id = req.params.request_id;
  Waste.updateStatus(id, 'rejected', (err) => {
    if (err) console.error(err);
    res.redirect('/collectorDashboard');
  });
};
