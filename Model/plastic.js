const conn = require('../Utils/database')
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
      this.notes
    ];

    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log("❌ Error inserting waste request:", err);
        return;
      }
      console.log("✅ Waste request inserted successfully!");
    });
  }
  static getAllWaste(id,callback) {
       const wasteLoggedQuery = `select * from waste 
                                  where id = ? ;`
            conn.query(wasteLoggedQuery,[id],(err,result) => {
              if(err){
                console.log("error fetching waste logged",err);
                callback(null)
                }
              else if(result.length === 0){
                console.log("no waste logged");
                callback(null)
                }   
               else {
                   const wasteLogged = result[0];
                   callback(wasteLogged);
                } 
     })
}
}
module.exports = Waste;