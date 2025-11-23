const Waste = require('../Model/plastic');
const User = require('../Model/Home');
const Collector = require('../Model/Collector');
const Rewards = require('../Model/Rewards');
const conn  = require('../Utils/database');

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
