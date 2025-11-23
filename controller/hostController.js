
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
exports.adminDashboard = (req, resp, next) => {
    console.log("Admin Dashboard accessed");

    const admin = req.session.user; // logged-in user
    console.log("Admin session user:", admin);

    if (!admin) {
        return resp.redirect('/login');
    }

    const { userType } = admin;

    // Check if the user is admin
    if (userType !== 'admin') {
        console.log("Unauthorized access");
        return resp.redirect('/login');
    }

    // 1️⃣ Fetch admin details
    conn.query('SELECT * FROM admin WHERE id = ?', [admin.id], (err, adminResults) => {
        if (err) {
            console.log("Database error (admin):", err);
            return resp.status(500).send("Database error");
        }

        if (adminResults.length === 0) {
            console.log("Admin not found");
            return resp.redirect('/login');
        }

        const adminData = adminResults[0];
        const sql = `
SELECT
 (SELECT IFNULL(SUM(quantity),0) FROM waste_requests WHERE status='completed') AS total_waste_collected,
 (SELECT COUNT(*) FROM users) AS total_users,
 (SELECT COUNT(*) FROM user_coupons) AS total_coupons_redeemed
`;

conn.query(sql, (err, data) => {
  if (err) throw err;
  const stats = data[0];

 


        // 2️⃣ Fetch all users
        User.getAllUsers((err, userResults) => {
            if (err) {
                console.log("Error fetching users:", err);
                return resp.status(500).send("Database error");
            }
         Collector.getAllCollectors((err, collectorResults) => {
            if (err) {
                console.log("Error fetching collectors:", err);
                return resp.status(500).send("Database error");
            }   
              // 4️⃣ Render Dashboard Page
                resp.render('host/adminDashboard', {
                    user: adminData,
                    users: userResults,
                    collectors: collectorResults,
                    waste: stats.total_waste_collected,
                    total_users: stats.total_users,
                    redeemed: stats.total_coupons_redeemed
                });
            });
        });
    });
    });
};


exports.Users = (req, res) => {
    const admin = req.session.user;

    conn.query('SELECT * FROM admin WHERE id = ?', [admin.id], (err, adminResults) => {
        if (err) {
            console.log("Database error (admin):", err);
            return res.status(500).send("Database error");
        }

        if (adminResults.length === 0) {
            console.log("Admin not found");
            return res.redirect('/login');
        }

        const adminData = adminResults[0];  // NOW accessible

        // 🔥 Move getAllUsers *inside* the admin query callback
        User.getAllUsers((err, users) => {
            if (err) {
                console.log("Error fetching users:", err);
                return res.status(500).send("Database error");
            }

            // 🔥 Now adminData is available here!
            res.render('host/allUsers', { 
                user: adminData,  // admin data
                users: users      // users list
            });
        });
    });
};

 


exports.Collectors = (req, res) => {
    const admin = req.session.user;

    conn.query('SELECT * FROM admin WHERE id = ?', [admin.id], (err, adminResults) => {
        if (err) {
            console.log("Database error (admin):", err);
            return res.status(500).send("Database error");
        }

        if (adminResults.length === 0) {
            console.log("Admin not found");
            return res.redirect('/login');
        }

        const adminData = adminResults[0];  // NOW accessible

        // 🔥 Move getAllUsers *inside* the admin query callback
        Collector.getAllCollectors((err, collectors) => {
            if (err) {
                console.log("Error fetching users:", err);
                return res.status(500).send("Database error");
            }

            // 🔥 Now adminData is available here!
            res.render('host/allCollectors', { 
                user: adminData,  // admin data
                collectors: collectors     // users list
            });
        });
    });
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

exports.productPage = (req, res) => {
  const products = [
    {
      id: 1,
      name: "Bamboo Toothbrush",
      price: 99,
      description: "Biodegradable bamboo toothbrush.",
      image: "/images/products/bamboo_toothbrush.jpeg"
    },
    {
      id: 2,
      name: "Metal Straw Set",
      price: 149,
      description: "Reusable stainless-steel straws.",
      image: "/images/products/metal_straws.jpeg"
    },
    {
      id: 3,
      name: "Cloth Grocery Bag",
      price: 199,
      description: "100% cotton reusable bag.",
      image: "/images/products/cloth_bag.jpeg"
    },
    {
      id: 4,
      name: "Recycled Notepad",
      price: 129,
      description: "Notebook made from recycled paper.",
      image: "/images/products/notepad.jpeg"
    },
    {
      id: 5,
      name: "Organic Hand Soap",
      price: 159,
      description: "Natural and chemical-free soap.",
      image: "/images/products/organic_soap.jpeg"
    }
  ];

  res.render("host/product", { products });
};

exports.applyCoupon = (req, res) => {
    const { product_id, price, coupon_code } = req.body;
    const userId = req.session.user.id;
     console.log("Applying coupon:", coupon_code, "for user ID:", userId, "on product ID:", product_id, "with price:", price);
    const sql = `
        SELECT uc.*, c.discount 
        FROM user_coupons uc 
        JOIN coupons c ON uc.coupon_id = c.id
        WHERE uc.code = ? AND uc.user_id = ? AND uc.status = 'active'
    `;

    conn.query(sql, [coupon_code, userId], (err, result) => {
      console.log("Coupon found:", result[0]);
        if (err) return res.status(500).send("Database error");
        
        if (result.length === 0) {
          console.log("Coupon not found or inactive for user:", result[0]);          
            return res.send("Invalid / expired coupon");
        }
        console.log("Coupon found:", result[0]);

        const discount = result[0].discount; // e.g. 10, 20, 30 (percentage)
        const originalPrice = Number(price);

        // ⭐ Percentage discount logic
        const finalPrice = originalPrice - (originalPrice * discount / 100);

        // Mark coupon as used
        conn.query(
            "UPDATE user_coupons SET status='used' WHERE code = ?",
            [coupon_code]
        );

        res.render("host/checkout", {
            productId: product_id,
            originalPrice,
            discount,
            finalPrice
        });
    });
};
