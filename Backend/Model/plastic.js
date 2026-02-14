const conn = require("../Utils/database");
class Waste {
  constructor(
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
  ) {
    this.user_id = user_id;
    this.collector_id = collector_id;
    this.waste_type = waste_type;
    this.quantity = quantity;
    this.pickup_address = pickup_address;
    this.pickup_lat = pickup_lat;
    this.pickup_lng = pickup_lng;
    this.preferred_date = preferred_date;
    this.preferred_time = preferred_time;
    this.notes = notes;
  }

  save() {
    const sql = `
      INSERT INTO waste_requests 
      (user_id, collector_id, waste_type, quantity, pickup_address, pickup_lat, pickup_lng, preferred_date, preferred_time, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      this.user_id,
      this.collector_id,
      this.waste_type,
      this.quantity,
      this.pickup_address,
      this.pickup_lat,
      this.pickup_lng,
      this.preferred_date,
      this.preferred_time,
      this.notes,
    ];

    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log("❌ Error inserting waste request:", err);
        return;
      }
      console.log("✅ Waste request inserted successfully!");
    });
  }
  static getAllWaste(collectorId, callback) {
    const query = `
    SELECT waste_requests.*, DATE(waste_requests.created_at) AS only_date, users.name AS user_name ,users.phone_no AS user_phone ,users.address AS user_address
    FROM waste_requests
    JOIN users ON waste_requests.user_id = users.id
    WHERE waste_requests.collector_id = ?;
      `;

    conn.query(query, [collectorId], (err, results) => {
      console.log(results);
      if (err) return callback(err);
      callback(null, results);
    });
  }

  static getRequestbyUser(userId, callback) {
    const query = `
            SELECT waste_requests.*, collector.name AS collector_name
            FROM waste_requests
            LEFT JOIN collector ON waste_requests.collector_id = collector.id
            WHERE waste_requests.user_id = ?;
            `;
    conn.query(query, [userId], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }

  static updateStatus(id, status, callback) {
    // const update = "update collector set totalcollections = totalcollections + 1 where id = ?  "
    // conn.query(update,[collectorId]);
    const sql = "UPDATE waste_requests SET status = ? WHERE request_id = ?";
    conn.query(sql, [status, id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  }

  static getWasteById(requestId, callback) {
    const sql = "SELECT * FROM waste_requests WHERE request_id = ?";
    conn.query(sql, [requestId], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }

  static getPendingWaste(userId, callback) {
    const sql = `SELECT waste_requests.*, users.name AS user_name ,users.email AS user_email ,users.address AS user_address
                    FROM waste_requests
                    JOIN users ON waste_requests.user_id = users.id
                    WHERE waste_requests.collector_id = ? AND status = 'pending'`;
    conn.query(sql, [userId], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  }
  static getCompletedWaste(userId, callback) {
    const sql = `SELECT waste_requests.*, users.name AS user_name ,users.email AS user_email ,users.address AS user_address
                    FROM waste_requests
                    JOIN users ON waste_requests.user_id = users.id
                    WHERE waste_requests.collector_id = ? AND status = 'completed'`;
    conn.query(sql, [userId], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  }
  static CountWaste(callback) {
    let count = `SELECT 
    SUM(status = 'completed') AS completed_count,
    SUM(status = 'pending') AS pending_count,
    SUM(status = 'accepted') AS accepted_count,
    SUM(status = 'cancelled') AS cancelled_count
FROM waste_requests;`;
    conn.query(count, (err, result) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        console.log(result[0]);
        return callback(null, result[0]);
      }
    });
  }
  static MonthlyWaste(callback) {
    let query = `
   SELECT 
    m.month_name AS month,
    COALESCE(SUM(w.quantity), 0) AS total_waste
FROM 
    (
        SELECT 1 AS month_number, 'Jan' AS month_name UNION
        SELECT 2, 'Feb' UNION
        SELECT 3, 'Mar' UNION
        SELECT 4, 'Apr' UNION
        SELECT 5, 'May' UNION
        SELECT 6, 'Jun' UNION
        SELECT 7, 'Jul' UNION
        SELECT 8, 'Aug' UNION
        SELECT 9, 'Sep' UNION
        SELECT 10, 'Oct' UNION
        SELECT 11, 'Nov' UNION
        SELECT 12, 'Dec'
    ) AS m
LEFT JOIN waste_requests w
    ON MONTH(w.created_at) = m.month_number
GROUP BY m.month_number, m.month_name
ORDER BY m.month_number;



  `;

    conn.query(query, (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  }
}
module.exports = Waste;
