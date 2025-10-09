const mysql = require('mysql2');

const conn = mysql.createConnection({
    host :'localhost',
    user : 'root',
    password :'Gayatri098',
    database : 'plastic_waste_exchange'
})

conn.connect((err) => {
    if(err){
        console.log('error while connecting',err);
    }else{
    console.log('connected') 
    }
})


module.exports = conn;