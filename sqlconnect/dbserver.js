var express          = require('express');
var app              = express();
var http             = require('http').Server(app);
const socketIO = require('socket.io');
const io = socketIO(http);
var path             = require('path');
var passport         = require('passport');
var LocalStrategy    = require('passport-local').Strategy;
var cookieParser     = require('cookie-parser');
var session          = require('express-session');
var passportSocketIO = require('passport.socketio');
var request          = require('request');
var bodyParser       = require('body-parser');
var mysql            = require('mysql');
var connection;

const db = mysql.createPool({
   connectionLimit: 100,
   host: "localhost",       //This is your localhost IP
   user: "root",         // "newuser" created in Step 1(e)
   password: "RizzoLab",  // password for the new user
   database: "ISPYD",      // Database name
   port: "3306"             // port name, "3306" by default
})
db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB connected successful: " + connection.threadId)
})

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const DB2 = mysql.createPool({
   
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT
})

const port = process.env.PORT
app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))

const bcrypt = require("bcrypt")
app.use(express.json())
//middleware to read req.body.<params>
//CREATE USER
app.post("/createUser", async (req,res) => {
const user = req.body.name;
const hashedPassword = await bcrypt.hash(req.body.password,10);
db.getConnection( async (err, connection) => {
 if (err) throw (err)
 const sqlSearch = "SELECT * FROM userTable WHERE user = ?"
 const search_query = mysql.format(sqlSearch,[user])
 const sqlInsert = "INSERT INTO userTable VALUES (0,?,?)"
 const insert_query = mysql.format(sqlInsert,[user, hashedPassword])

 await connection.query (search_query, async (err, result) => {
  if (err) throw (err)
  console.log("------> Search Results")
  console.log(result.length)
  if (result.length != 0) {
   connection.release()
   console.log("------> User already exists")
   res.sendStatus(409) 
  } 
  else {
   await connection.query (insert_query, (err, result)=> {
   connection.release()
   if (err) throw (err)
   console.log ("--------> Created new User")
   console.log(result.insertId)
   res.sendStatus(201)
  })
 }
}) //end of connection.query()
}) //end of db.getConnection()
}) //end of app.post()