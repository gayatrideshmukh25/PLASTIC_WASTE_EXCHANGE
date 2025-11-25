const conn = require('../Utils/database')
class Collector {

   constructor(name,email,password,userType,address,phone_no,city,state,pincode,latitude, longitude,availability){
    this.name = name;
    this.email = email;
    this.password = password;
    this.userType = userType;
    this.address = address;
    this.phone_no = phone_no;
    this.city = city;
    this.state = state;
    this.pincode = pincode;
    this.latitude = latitude;
    this.longitude = longitude;
    this.availability = availability;
   }

   save(){
     const collector = `insert into collector (name,email,password,userType,address,phone_no,city,state,pincode,latitude, longitude,availability) values (?,?,?,?,?,?,?,?,?,?,?,?);`

    conn.query(collector,[this.name,this.email,this.password,this.userType,this.address,this.phone_no,this.city,this.state,this.pincode,this.latitude || null,this.longitude || null,this.availability],(err,result) => {
        if(err){
            console.log('error while inserting',err);
            return;
        }
        console.log("successfully",result);
   })
}
   static getCollector(email,callback){
      const collector = `select * from collector 
                  where email = ? ; `
   conn.query(collector,[email],(err,result) => {
    if(err){
        console.log(err);
        callback(err,null);
        return;
    }
    else if(result.length === 0){
        callback(null,null);
        return;
    }else{
        console.log(result[0]);
    callback(null,result[0]);
    return;
    }
})
   }
   static getCollectorbyId(id,callback){
      const collector = `select * from collector 
                  where id = ? ; `
   conn.query(collector,[id],(err,result) => {
    if(err){
        console.log(err);
        callback(err,null);
        return;
    }
    else if(result.length === 0){
        callback(null,null);
        return;
    }else{
    callback(null,result[0]);
    return;
    }
})
   }
    static getAllCollectors(callback) {
    const query = 'SELECT * FROM collector';
    conn.query(query, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }
}
module.exports = Collector;