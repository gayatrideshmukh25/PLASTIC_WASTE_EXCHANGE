
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

  if (!userLat || !userLng) {
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