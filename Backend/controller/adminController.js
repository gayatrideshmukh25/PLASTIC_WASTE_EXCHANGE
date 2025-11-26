const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Rewards = require('../Model/Rewards');
const conn  = require('../Utils/database');

exports.adminDashboard = (req, resp, next) => {
    console.log("Admin Dashboard accessed");

    const admin = req.session.user; 
    console.log("Admin session user:", admin);

    if (!admin) {
        return resp.json({success:false});
    }

    const { userType } = admin;

    
    if (userType !== 'admin') {
        console.log("Unauthorized access");
        return resp.json({success:false});
    }

    
    conn.query('SELECT * FROM admin WHERE id = ?', [admin.id], (err, adminResults) => {
        if (err) {
            console.log("Database error (admin):", err);
            return resp.status(500).json("Database error");
        }

        if (adminResults.length === 0) {
            console.log("Admin not found");
            return resp.json({success:false});
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

 


        
        User.getAllUsers((err, userResults) => {
            if (err) {
                console.log("Error fetching users:", err);
                return resp.json(500).json("Database error");
            }
         Collector.getAllCollectors((err, collectorResults) => {
            if (err) {
                console.log("Error fetching collectors:", err);
                return resp.status(500).json("Database error");
            }   
              
                resp.json( {success :true,
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
    const id = admin.id;
    conn.query('SELECT * FROM admin WHERE id = ?', [id], (err, adminResults) => {
        if (err) {
            console.log("Database error (admin):", err);
            return res.status(500).json("Database error");
        }

        if (adminResults.length === 0) {
            console.log("Admin not found");
            return res.json({success:false});
        }

        const adminData = adminResults[0];  
        User.getAllUsers((err, users) => {
            if (err) {
                console.log("Error fetching users:", err);
                return res.status(500).json("Database error");
            }

            
            res.json( { success:true,
                user: adminData,  
                users: users      
            });
        });
    });
};

 


exports.Collectors = (req, res) => {
    const admin = req.session.user;

    conn.query('SELECT * FROM admin WHERE id = ?', [admin.id], (err, adminResults) => {
        if (err) {
            console.log("Database error (admin):", err);
            return res.status(500).json("Database error");
        }

        if (adminResults.length === 0) {
            console.log("Admin not found");
            return res.json({success:false});
        }

        const adminData = adminResults[0];  
        Collector.getAllCollectors((err, collectors) => {
            if (err) {
                console.log("Error fetching users:", err);
                return res.status(500).json("Database error");
            }

            
            res.json({ success:true,
                user: adminData,  
                collectors: collectors     
            });
        });
    });
};

exports.addCoupons = (req, res) => {
    const {title, description, pointsRequired,discount} = req.body;
    console.log(title)
    Rewards.addCoupon(title, description, pointsRequired,discount, (err, result) => {
        if (err) {
            console.log("Error adding coupon:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "Coupon added successfully" });
    });

}

exports.getCoupons = (req, res) => {
    Rewards.getAllCoupons((err, coupons) => {
        if (err) {
            console.log("Error fetching coupons:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, coupons });
    });
}

exports.deleteCoupons = (req,res) =>{
  const {id} = req.body;
  Rewards.deleteCoupons(id,(err,result) => {
    if (err) {
            console.log("Error deleting coupon:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true });
  })
}
