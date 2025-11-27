const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const Collector = require('../Model/Collector');



exports.collectorDashboard = (req, res, next) => {
    const collector = req.session.user;

    if (!collector) {
        return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const id = collector.id;

    
    Collector.getCollectorbyId(id, (err, collectorData) => {
        if (err) {
            console.log("DB Error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (!collectorData) {
            console.log("Collector not found");
            return res.status(404).json({ success: false, message: "Collector not found" });
        }

        // 2. Check role
        if (collectorData.userType !== "collector") {
            console.log("Unauthorized access");
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        Waste.getAllWaste(id, (err, wasteLogged) => {
            if (err) {
                console.log("Waste fetch error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            return res.json({
                success: true,
                user: collectorData,
                wasteLogged
            });
        });
    });
};


exports.pendingTasks = (req, resp, next) => {
    const  user = req.session.user;
    const {id} = user;
     Collector.getCollectorbyId(id,(err,collector) => {
        if(collector.userType !== 'collector'){
            console.log("unauthorized access");
            return resp.json({success:false});
        };
    Waste.getPendingWaste(id,(err,wasteLogged) => {
        if(err){
            console.log(err);
            return resp.status(500).json("Database error");
        }    
    resp.json({success:true,user : collector,wasteLogged : wasteLogged})
    });
    });
}


exports.completedTasks =(req,resp,next) => {
       const  user = req.session.user;
    const {id} = user;
     Collector.getCollectorbyId(id,(err,collector) => {
        if(collector.userType !== 'collector'){
            console.log("unauthorized access");
            return resp.json({success:false});
        };
    Waste.getCompletedWaste(id,(err,wasteLogged) => {
        if(err){
            console.log(err);
            return resp.status(500).json("Database error");
        }    
    resp.json({success:true,user : collector,wasteLogged : wasteLogged})
    });
    });
}


exports.completeRequest = (req,res) => {
    const collector = req.session.user;
    const collectorId = collector.id;
    const id = req.params.request_id;
    console.log("Completing request ID:", id)
    Waste.getWasteById(id, (err, waste) => {
      if (err) {
        return res.status(500).json("Database error");
      }
      if (!waste) {
        return res.status(404).json("Request not found");
      }
     Waste.updateStatus(id, 'completed',collectorId, (err, result) => {
      if (err) {
        console.log("Error updating status:", err);
        return res.status(500).json("Database error");
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
            console.log("Points added successfully:");
        }
      
      res.json({success:true,redirectTo:'/collectorDashboard.html'});
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
      res.json({success:true,redirectTo:'/collectorDashboard.html'});
    });
}


exports.rejectRequest = (req, res) => {
  const id = req.params.request_id;
  Waste.updateStatus(id, 'rejected', (err) => {
    if (err) console.error(err);
    res.json({success:true,redirectTo:'/collectorDashboard.html'});
  });
};
