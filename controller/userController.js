
const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Rewards = require('../Model/Rewards');
const conn  = require('../Utils/database');

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





