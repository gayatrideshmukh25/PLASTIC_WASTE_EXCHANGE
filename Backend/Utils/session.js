
const conn = require('./database');

function getSession(sessionId,callback)  { 
    console.log("I am in get session");
// const sessionId = req.cookies.session_id;
    const user = `select * from sessions where session_id = ?;`
    conn.query(user,[sessionId],(err,result) => {
      if(err){
            console.log("error fetching user");
            return;
             }
      else if(result.length === 0){
            console.log("invalid user");
             return;
            }
        const session = result[0];
      if(!session){
        console.log("invalid session");
        return;
        }
    const userId = session.user_id;
    const userQuery = `select * from users where id = ?;`
    conn.query(userQuery,[userId],(err,result) => {
        if(err){
            console.log("error fetching user");
            callback(null);
        }
       else if(result.length === 0){
            console.log("invalid user");
            callback(null);
        }
        else {
        const user = result[0];
        console.log("Returning User",user);
         callback(user);
        }
    })
})
}
module.exports = getSession;