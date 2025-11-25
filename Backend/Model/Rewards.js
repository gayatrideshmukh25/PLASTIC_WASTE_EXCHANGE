const conn = require("../Utils/database");
class Rewards {
       static getAllCoupons(callback) {
          const query = `SELECT * FROM coupons`;
          conn.query(query, callback);
  }
    static getUserCoupons(userId, callback) {
    const query = `
          SELECT uc.id, c.name, c.description,uc.code, uc.status
          FROM user_coupons uc
          JOIN coupons c ON uc.coupon_id = c.id
          WHERE uc.user_id = ?
          `;
    conn.query(query, [userId], callback);
  }
     static redeemCoupon(userId, couponId, callback) {
     // 1. Check if user has enough points
        conn.query(
           "SELECT reward_points FROM users WHERE id = ?",
           [userId],
           (err, result) => {
               if (err) return callback(err); 
               if (result.length === 0) return callback(new Error("User not found"));

        const userPoints = result[0].reward_points;
        conn.query(
          "SELECT points_required FROM coupons WHERE id = ?",
          [couponId],
          (err2, res2) => {
            if (err2) return callback(err2);
            if (res2.length === 0)
              return callback(new Error("Coupon not found"));
            const requiredPoints = res2[0].points_required;

            if (userPoints < requiredPoints) {
              return callback(
                new Error("Not enough points to redeem this coupon.")
              );
            }
             
            // 2. Deduct points & insert coupon
            conn.query(
              "UPDATE users SET reward_points = reward_points - ? WHERE id = ?",
              [requiredPoints, userId],
              (err3) => {
                if (err3) return callback(err3);
                const uniqueCode = 'CPN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                conn.query(
                  "INSERT INTO user_coupons (user_id, coupon_id ,code ,status ) VALUES (?, ? ,? ,?)",
                  [userId, couponId,uniqueCode,'active'],
                  callback
                );
              }
            );
          }
        );
      }
    );
  }
}

module.exports = Rewards;
