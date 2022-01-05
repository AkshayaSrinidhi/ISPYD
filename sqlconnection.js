// Loads functions from modules
// Uses express, a web framework
// https://expressjs.com/ 
var express          = require('express');
// This starts express, now its' functionality can be used
// through app
var app              = express();

const {check, validationResult} = require('express-validator');

// Start the server and send it the express object
// This needs a listening part
// https://stackoverflow.com/a/38063557
var http             = require('http').Server(app);
var io               = require('socket.io').listen(http);

// Utilities for working with filesystems
var path             = require('path');

// Authentication module
// http://www.passportjs.org/
var passport         = require('passport');
// Userna,e and password authentication 
var LocalStrategy    = require('passport-local').Strategy;
// Authentication with facebook
var FacebookStrategy = require('passport-facebook').Strategy;

// Middleware for transfering data between the client and the
// server
var cookieParser     = require('cookie-parser');
var session          = require('express-session');

//this is for socket and passport sharing the same session with user object.
var passportSocketIO = require('passport.socketio');

// Load Redis session storage for express

//var redis = require('redis');
var RedisStore       = require('connect-redis')(session);
//var redisClient = redis.createClient();
// https://github.com/NodeRedis/node-redis
//var sessionStore = new RedisStore({host:'127.0.0.1:8080'});


// This one is currently depracted, it is used to make
// http calls 
var request          = require('request');
// For parsing http request bodies
var bodyParser       = require('body-parser');
//	mysql database module 
var mysql            = require('mysql');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'RizzoLab',
  database : 'images'
}); 


connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
});

 connection.end(function(err) {
  
});