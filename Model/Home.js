const conn = require('../Utils/database')
class User {

   constructor(name,email,hash,userType,address,phone_no){
    this.name = name;
    this.email = email;
    this.hash = hash;
    this.userType = userType;
    this.address = address;
    this.phone_no = phone_no;
   }

   save(){
     const user = `insert into users (name,email,password,userType,address,phone_no) values (?,?,?,?,?,?);`

    conn.query(user,[this.name,this.email,this.hash,this.userType,this.address,this.phone_no],(err,result) => {
        if(err){
            console.log('error while inserting',err);
            return;
        }
        console.log("successfully",result);
   })
}
   static getUser(email,callback){
      const user = `select * from users 
                  where email = ? ; `
   conn.query(user,[email],(err,result) => {
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
   static getUserbyId(id,callback){
      const user = `select * from users 
                  where id = ? ; `
   conn.query(user,[id],(err,result) => {
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
}
module.exports = User;