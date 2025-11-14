
const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Rewards = require('../Model/Rewards');
const conn  = require('../Utils/database');



exports.home = (req,resp,next) => {
    resp.render('host/home');
}

exports.userDashboard = (req,resp,next) => {
      const  user = req.session.user;
      const {id} = user;
      User.getUserbyId(id,(err,user) => {
        if(user.userType !== 'user'){
            console.log("unauthorized access");
            return resp.redirect('/login');
        };
      Waste.getRequestbyUser(id,(err,wasteLogged) => {
      if(err){
        console.log(err);
         return resp.status(500).send("Database error");
      }
        resp.render('host/userDashboard',{user : user,wasteLogged : wasteLogged})
      });
    });
}

exports.collectorDashboard = (req,res,next) => {
    const collector = req.session.user;
    const {id} =collector;
    Collector.getCollectorbyId(id,(err,collector) => {
        if(collector.userType !== 'collector'){
            console.log("unauthorized access");
            return res.redirect('/login');
        };
    Waste.getAllWaste(id,(err,wasteLogged) => {
     if(err){
       console.log(err);
      return res.status(500).send("Database error");
     }
    res.render('host/collectorDashboard',{user : collector, wasteLogged : wasteLogged,User : User});
});
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

exports.postRequest = (req, res) => {
   const user_id = req.session.user?.id;  // use optional chaining for safety

  if (!user_id) {
    return res.status(401).send("User not logged in");
  }
  const {
     collector_id, waste_type, quantity,
    pickup_address, pickup_lat, pickup_lng,
    preferred_date, preferred_time, notes
  } = req.body;
  // console.log(req.body);
  const wasteRequest = new Waste(
    user_id,
    collector_id,
    waste_type,
    quantity,
    pickup_address,
    pickup_lat,
    pickup_lng,
    preferred_date,
    preferred_time,
    notes
  );
 
  wasteRequest.save();
  res.render("host/postRequest", { message: "Waste Pickup Request Sent!" });
};

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.nearestCollector = (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }
    
  conn.query('SELECT * FROM collector', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!results.length) return res.json({ message: 'No collectors found' });

    let nearest = null;
    let minDistance = Infinity;

    results.forEach(c => {
      if (c.latitude && c.longitude) {
        const dist = getDistance(userLat, userLng, c.latitude, c.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = c;
        }
      }
    });

    if (nearest) {
      res.json({
        id : nearest.id,
        name: nearest.name,
        phone: nearest.phone_no,
        address: nearest.address,
        distance: minDistance.toFixed(2)
      });
    } else {
      res.json({ message: 'No nearby collectors found' });
    }
  });
};

exports.rewards = (req, res) => {
    const user = req.session.user;
    const {id} = user;
    User.getUserbyId(id,(err,user) => {
        if(user.userType !== 'user'){
            console.log("unauthorized access");
            return res.redirect('/login');
        } ;
      
     Rewards.getAllCoupons((err, coupons) => {
    if (err) return res.status(500).send('Database error');   
     Rewards.getUserCoupons(id,(err,userCoupons) => {
      if (err) return res.status(500).send('Database error');
      res.render('host/rewards',{user : user,coupons,userCoupons,message : [] });
     })  
     });
    });
}

exports.redeemCoupon = (req, res) => {
  const user = req.session.user;
  const userId = user.id;
  const couponId = req.body.coupon_id;

  Rewards.redeemCoupon(userId, couponId, (err) => {
    if (err) {
      const msg = err.message;
        Rewards.getAllCoupons((err, coupons) => {
        Rewards.getUserCoupons(userId, (err, userCoupons) => {
          return res.render("host/rewards", {
            user: user,
            coupons: coupons,
            userCoupons: userCoupons,
            message: msg        
          });
        });
      });
      return;
    }
    res.redirect('/userDashboard/rewards');
  });
};