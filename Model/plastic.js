const conn = require('../Utils/database')
class Waste {
   constructor(id,wasteType,quantity){
    this.id = id;
    this.wasteType = wasteType;
    this.quantity = quantity;
   }

   save(){
      const waste = `insert into waste (id,wasteType,quantity) values(?,?,?);`
         conn.query(waste,[this.id,this.wasteType,this.quantity],(err,results) => {
              if(err){
                 console.log("error logging request",err);
                  return;
                }
           
  })
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