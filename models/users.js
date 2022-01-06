const sql = require("./db.js");

// constructor
const User = function(user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      //result(err, null);
      return;
    }

    console.log("created user: ", { id: res.insertId, ...newUser });
    //result(null, { id: res.insertId, ...newUser });
  });
};

User.findById = (id, result) => {
    sql.query(`SELECT * FROM users WHERE id = ${id}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        //result(err, null);
        return;
      }
  
      if (res.length) {
        console.log("found user: ", res[0]);
        //result(null, res[0]);
        return;
      }
  
      // not found User with the id
      //result({ kind: "not_found" }, null);
    });
  };
  
  User.findByEmail = (searchEmail, result) => {
    const getUsersQuery = 'SELECT * FROM users WHERE email = ?';
    sql.query(getUsersQuery,[searchEmail], (err, res) => {
      if (err) {
        console.log("error: ", err);
        //result(err, null);
        return;
      }
  
      if (res.length) {
        console.log("found user: ", res[0]);
        //result(null, res[0]);
        return res[0];
      }
  
      // not found User with the id
      //result({ kind: "not_found" }, null);
    });
  };

  User.getAll = result => {
    let query = "SELECT * FROM users";
  
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        return err;
      }
  
      console.log("users: ", res);
      return res;
    });
  };

  User.assignAll = result => {
    const users = User.getAll();
    return users
  };

  User.assignUser = email => {
    const user = User.findByEmail(email);
    return user
  };
  
  User.updateById = (id, name, password) => {
    sql.query(
      "UPDATE users SET name = ?, password = ? WHERE id = ?",
      [user.name, user.password, id],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          //result(null, err);
          return;
        }
  
        if (res.affectedRows == 0) {
          // not found Tutorial with the id
          //result({ kind: "not_found" }, null);
          return;
        }
  
        console.log("updated user: ", { id: id, ...tutorial });
        //result(null, { id: id, ...tutorial });
      }
    );
  };
  
  User.remove = (id, result) => {
    sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      if (res.affectedRows == 0) {
        // not found Tutorial with the id
        result({ kind: "not_found" }, null);
        return;
      }
  
      console.log("deleted user with id: ", id);
      result(null, res);
    });
  };
  
  User.removeAll = result => {
    sql.query("DELETE FROM users", (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      console.log(`deleted ${res.affectedRows} users`);
      result(null, res);
    });
  };
  
  
module.exports = User;