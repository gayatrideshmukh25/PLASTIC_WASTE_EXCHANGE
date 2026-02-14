const conn = require("../Utils/database");
class User {
  constructor(name, email, hash, userType, address, phone_no) {
    this.name = name;
    this.email = email;
    this.hash = hash;
    this.userType = userType;
    this.address = address;
    this.phone_no = phone_no;
  }

  save() {
    const user = `insert into users (name,email,password,userType,address,phone_no) values (?,?,?,?,?,?);`;

    conn.query(
      user,
      [
        this.name,
        this.email,
        this.hash,
        this.userType,
        this.address,
        this.phone_no,
      ],
      (err, result) => {
        if (err) {
          console.log("error while inserting", err);
          return;
        }
        console.log("successfully", result);
      },
    );
  }
  static getUser(email, callback) {
    const user = `select * from users 
                  where email = ? ; `;
    conn.query(user, [email], (err, result) => {
      if (err) {
        console.log(err);
        callback(err, null);
        return;
      } else if (result.length === 0) {
        callback(null, null);
        return;
      } else {
        console.log(result[0]);
        callback(null, result[0]);
        return;
      }
    });
  }
  static getUserbyId(id, callback) {
    const user = `select * from users 
                  where id = ? ; `;
    conn.query(user, [id], (err, result) => {
      if (err) {
        console.log(err);
        callback(err, null);
        return;
      } else if (result.length === 0) {
        callback(null, null);
        return;
      } else {
        callback(null, result[0]);
        return;
      }
    });
  }

  static add_points(user_id, points, callback) {
    const updatePoints = `update users set reward_points = reward_points + ? where id = ?;`;
    conn.query(updatePoints, [points, user_id], (err, result) => {
      if (err) {
        console.log(err);
        callback(err, null);
        return;
      }
      callback(null, result);
    });
  }

  static getAllUsers(callback) {
    const query = `SELECT * FROM users WHERE userType = 'user';`;
    conn.query(query, (err, results) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  static getCollectorById(id, callback) {
    const query = `SELECT * FROM collector WHERE id = ?;`;
    conn.query(query, [id], (err, results) => {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      callback(null, results[0]);
    });
  }
}
module.exports = User;
