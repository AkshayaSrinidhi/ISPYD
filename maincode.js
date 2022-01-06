
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
//var RedisStore       = require('connect-redis')(session);
var request          = require('request');
var bodyParser       = require('body-parser');
var mysql            = require('mysql2');

/*
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost/annotations', { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

const annotationsRouter = require('./models/annotations')
app.use('/annotations',annotationsRouter)

const usersRouter = require('./models/users')
app.use('/users',usersRouter)

const imagesRouter = require('./models/images')
app.use('/',imagesRouter)
*/

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "RizzoLab",
  database: "ISPYD",
});



db.connect( (err)=> {
  if (err) throw (err)
  console.log ("DB connected successful..");
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json())
var flash            = require('connect-flash');
var nodemailer = require('nodemailer');
var async = require('async');
var formidable = require('formidable');
var DEV              = false;
const fs = require('fs');
const { resolve } = require('path');
const e = require('express');
const { transformAuthInfo } = require('passport');
const { name } = require('ejs');

/*

connection = {
    query: function () {
	
        var queryArgs = Array.prototype.slice.call(arguments),
			// Array
            events = [],
			// Object
            eventNameIndex = {};
		
        pool.getConnection(function (err, conn) {
            if (err) {
				// I suspect this will execute code corresponding
        // to various custom error types
                console.log('getting connection from pool error: ' + err);
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }
      // If no error
            if (conn) {
                console.log('pool connection gotten');
                var q = conn.query.apply(conn, queryArgs);
                q.on('end', function () {
          // Release connection back to the pool
                    conn.destroy();
                    console.log('pool connection released');
                });
                events.forEach(function (args) {
                    q.on.apply(q, args);
                });
            }
            
        });
		// Returns an object made on a spot with a member on that is a function
        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    }
};
*/

function alreadyLoggedIn(req, res, next) {
    if (req.isAuthenticated()) { // if for some reason the user goes to login or signup
      res.redirect('/');    // while logged in already, take them to the homepage
    }
    else
      return next();
  }
  
function mustBeLoggedIn(req, res, next) {
  
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
      return next();
    }
  
    // if they aren't redirect them to the login page
    req.flash('err', "Please log in first.");
    res.redirect('/login');
  }

app.use(cookieParser());
app.use(flash());


app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: false }));

app.use('/images',  express.static(__dirname + '/images'));
app.set('view engine', 'ejs'); 

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

// To maintain a session with user credentials through cookies here only by storing the user ID
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {

  console.log('am deserializing user with id: ' + id);
  connection.query({
    sql: "SELECT * FROM auth WHERE id = ?",
    values: [id]
  }, function(err, rows) {

    if (err) {
     // done(err);
     console.log('Error while deserializing: ' + err);
     done(err);
    }
    var user = new Object();
    user.id = rows[0].id;
    user.email = rows[0].email;
    user.name = rows[0].name; 
    done(err, user);
  });
});

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true
}, 
function(req, email, password, done) {
  
  connection.query({
    sql: "SELECT * FROM `auth` WHERE `email` = ? OR 'name' = ?",
    values: [email, req.body.name]
  }, function(err, rows) {
      if (err) {
        console.log('Error when local-signup: ' + err);
        return done(err);
      }

      if (rows[0]){ //user exists
        if (rows[0].name == req.body.name) {
          return done(null, false, req.flash('err', 'That name is already taken.'));
        } else {
          return done(null, false, req.flash('err', 'That email is already taken.'));
        }
      }

      else { //user does not exist
        var newUser = new Object();
        newUser.email = email;
        newUser.password = bcrypt.hashSync(password);
        newUser.name = req.body.name;

        connection.query({
            sql: "INSERT INTO auth (email, password, name) values (?, ?, ?)",
            values: [email, newUser.password, newUser.name]
        }, function(err, rows) {
          if (err) throw err;
          //set up req.user id, this is the same id they will have in the database
          newUser.id = rows.insertId;
          
          var currentdate = new Date(); 
          var datetime = currentdate.getUTCDate() + "/" + (currentdate.getUTCMonth()+1)  + "/" + currentdate.getUTCFullYear();
          connection.query({
            sql: "INSERT INTO userInfo (id, email, gender, name, birthday, reg_date, recent_log_in) VALUES (?, ?, ?, ?, ?, ?, ?)",
            values: [newUser.id, email, req.body.pronoun, newUser.name, req.body.birthday, datetime, datetime]
          }, function(err, rows) {
            if (err) throw err;
          });
          fs.mkdir('./public/datasets/user'+newUser.id, function(err){
            if (err){
              console.log("error when fs creating a folder for sign up user: " + err);
              throw(err);
            } else {
              const browsingDataWriter = createCsvWriter({
                path:'public/datasets/user'+newUser.id+'/navigationData_user'+newUser.id+".csv",
                header: [
                  {id:'time',title:'Time (UTC)'},
                  {id:'action',title:'Action'},
                  {id:'detail',title:'Detail'},
                  {id:'notes',title:'Notes'},
                ],
              });

              detailedDateTime = currentdate.getUTCDate() + "_" + (currentdate.getUTCMonth()+1)  + "_" + currentdate.getUTCFullYear() + " @ "  + currentdate.getUTCHours() + ":"  + currentdate.getUTCMinutes() + ":" + currentdate.getUTCSeconds();
              let data = [
                {
                  time: detailedDateTime,
                  action: "Sign-Up",
                  detail: "",
                  notes: ""
                }
              ];
              browsingDataWriter.writeRecords(data).then(()=>{
                console.log("successfully created navigationData csv and recorded down sign up time.");
              });

              console.log("poggers");
            }
          });

          return done(null, newUser);
        });

      }
  });
}));


//error catcher / handler
app.use(function(err,req,res,next){
  if (err) {
    console.log('error detected');
    req.logout();
    console.log('logged out cuz error');
    if (req.originalUrl == "/login") {
      console.log('originalurl is login, so we go next');
      next();
    } else {
      console.log("originalurl is not login, so we go login");
      req.redirect('/login');
    }
  } else {
    next();
  }
})


// Client reaching the home page
app.get('/', function(req, res) {
  if (req.isAuthenticated() == 1) {
    res.redirect('/profile');
  } else {
    res.redirect('/index');
  }
});

// Add a user
app.post('/users', (req, res) => {
  console.log('Trying to add user using api')
  
  let user = {
      name: req.body.user_name,
      email: req.body.email,
      password: req.body.password
  };
  		
	console.log('Trying to add user using api')
	
			
  let sql = 'INSERT INTO users set ?'
  let query = db.query(sql, user, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.send('New User Created...')
    res.redirect('/login');
  });
  
});

//this is callback for us, not the browser default callback.
app.get('/callback', function(req, res) {
  res.redirect(req.session.lastPage || '/index'); //go to the last page, if no last page recorded for some reason, we default to going to About page. 
});


app.get('/index', function(req, res) { //this will be the 'About' page
  req.session.lastPage = '/index';
  if (req.isAuthenticated()) {
    dataLogger(req.user.id,"move","about");
    res.render('pages/index', {
      id: req.user.id,
      auth: req.isAuthenticated(),
      page: 3
    });
  } else {
    res.render('pages/index', {
      id: -1,
      auth: req.isAuthenticated(),
      page: 3
    });
  }
});


app.get('/annotation', alreadyLoggedIn, function(req, res) { 
  req.session.lastPage = '/annotation';
  res.render('pages/annotation', {
    auth: req.isAuthenticated(),
    page: 1
  });
});


//------------------------------------------------------------------------------------Tagging

app.get('/tag', mustBeLoggedIn, function(req, res) { //this will be the 'TAG' Page UNDER PROFILE ONLY ACCESSIBLE IF AUTHENTICATED
  req.session.lastPage = '/tag';                      //not implemented YET
  


  connection.query({
    sql: "SELECT * FROM userInfo WHERE id = ?",
    values: [req.user.id]
  }, function(err,rows){
    if (err)
    {
      console.log('Error while retriving pics_done from auth \n' + err);
      return (err);
    }
    else
    {
      if ( rows[0].tutorial_completion == 0) {
        dataLogger(req.user.id,"move","tag_tutorial");
        res.render('pages/tag_tutorial',{
          id: req.user.id,
          auth: req.isAuthenticated(),
          page: 0,
          pic: 'img1',
          errmsg: req.flash('err')
        });
      } else {
        let curr_pic_name = "img" + (rows[0].pics_done+1);
        dataLogger(req.user.id,"move","tag",curr_pic_name);
        res.render('pages/tag_test', {
          id: req.user.id,
          auth: req.isAuthenticated(),
          page: 0,
          pic: curr_pic_name,
          survey_completion: rows[0].survey_completion,
          errmsg: req.flash('err'),
          id: req.user.id
        });
      }
    }
  });


});

app.post('/tag', mustBeLoggedIn, function(req,res) {
  if (!JSON.parse(req.body.tag_list)) 
  {
    console.log('User attempts to pass in illegal JSON');
    res.redirect('/logout'); 
  }

  let tag_list = JSON.parse(req.body.tag_list);
  //checks for legal tag_list, if not, log user out 
  if (( !(Array.isArray(tag_list)) ) || tag_list.length >= 500) {
    console.log('User attempts to pass in illegal JSON');
    console.log(tag_list);
    res.redirect('/logout'); 
  }
  console.log(tag_list);
  console.log(req.body.pic + typeof req.body.pic);
  console.log('user id: ' + req.user.id );
  console.log(req.body.time);
  //res.redirect('/tag');

  connection.query({ //first mysql check if user id already exists with the picture name
    sql: "SELECT * FROM tagRecords WHERE id = ? AND pic_name = ?", 
    values: [req.user.id,req.body.pic]
  }, function(err, rows) {
    //connection.end();
    if (err)
    {
      console.log('beep boop, error' + err);
      return (err);
    }

    if (rows.length) //if user already tagged the image
    {
      console.log('beep boop, user tried to retag.');
      req.flash('err', 'User already tagged this image');
      res.redirect('/tag');
    }
    //we now update tagRecords table
    else { 
      connection.query({
        sql: "INSERT INTO tagRecords (id, time, pic_name, tags) VALUES (?, ?, ?, ?)", //the tagRecords have 4 columns: id -> INT PRIMARY KEY user id, time -> STR time of recording in UTC, pic_name -> STR file name of the tagged pic, tags -> JSON json file containing the tags in the format of [[name1,x1,y1],[name2,x2,y2]...]  
        values: [req.user.id, req.body.time, req.body.pic, req.body.tag_list]
      }, function (err, rows) {
        if (err)
        {
          console.log("tag insertion error: \n " + err);
          return err;
        }
        else{
          connection.query({
            sql:"UPDATE userInfo SET tags_done = tags_done + " + tag_list.length + ", pics_done = pics_done + 1 WHERE id = ?",
            values:[req.user.id]
          }, function (err,rows){
            if (err)
            {
              console.log("auth table pic done update error: \n" + err);
              return err;
            }
            else
            {
              console.log("New tag inserted. User Id: " + req.user.id + "\nPicture Name: " + req.body.pic + "\n Time submitted: " + req.body.time + "\n");
              req.flash('err', 'Tags Successfully submitted!')
              res.redirect('/tag');
            }
          });
        }
      });
    }
  });
});


//------------------------------------------------------------------------LOGIN, SIGNUP, and LOGOUT

app.get('/login', alreadyLoggedIn, function(req, res) {
  req.session.lastPage = '/login';
  res.render('pages/login', {
    auth: req.isAuthenticated(),
    errmsg: req.flash('err'),
    page: -1
  });
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));


app.get('/signup', alreadyLoggedIn, function(req, res) {
  req.session.lastPage = '/signup';
  res.render('pages/signup', {
    auth: req.isAuthenticated(),
    errmsg: req.flash('err'),
    page: -1
  });
});

app.post('/signup', alreadyLoggedIn, function(req, res, next) {
  if (!(req.body.password == req.body.confirm)) {
    req.flash('err', 'Passwords do not match.');
    res.redirect('/signup');
  }
  else {
    req.session.terms = req.body.terms;
    return next();
  }
},passport.authenticate('local-signup', {
  successRedirect: '/edit',
  failureRedirect: '/signup',
  failureFlash: true
}));


app.get('/logout', function(req, res){
  dataLogger(req.user.id,"logout");
  req.logout();
  res.redirect('/');
});


//------------------------------------------RESET-PASSWORD-FROM-EMAIL------------------------
//first, user goes to forgot, it renders a form that would POST their email information.
app.get('/forgot', alreadyLoggedIn, function(req,res) { 
  res.render('pages/forgot', {
    auth: req.isAuthenticated(),
    errmsg: req.flash('err'),
    page: -1
    
  });
});

// this is where the posted email information is handled. If the email exists in database, a token with 1h validity is generated and sent to that email. This token and validity is stored inside auth table in mysql.
// http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
app.post('/forgot', function(req, res, next) {
  async.waterfall([ //using waterfall to handle nested callbacks
    function(done) { //generate a temporary token
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token); //passes the token 
      });
    },

    function(token, done) { //token catches token
      connection.query({ //first mysql check if email exists
        sql: 'SELECT * FROM auth WHERE email = ?',
        values: [req.body.email]
      }, function(err, rows) {
        //connection.end();
        if (err)
          return (err);

        if (!rows.length)
        {
          req.flash('err', 'No user found associated with email.');
          res.redirect('/forgot');
        }
        else { //if email exists, we do another mysql connection this time to update the user row with the generated token and its validity.
         // Correct user and password
          var user = new Object();
          user.id       = rows[0].id;
          user.email    = rows[0].email;
          user.password = rows[0].password;
          user.name     = rows[0].name;
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour validity
        
          connection.query({ //
            sql: "UPDATE auth set resetPasswordToken =? , resetPasswordExpires =? WHERE id =?",
            values: [user.resetPasswordToken, user.resetPasswordExpires, user.id]
          }, function(err, rows) {
            if (err) throw err;
          });
          
          
          done(err, token, user); //pass the token and the user
        }
      });
    },
    function(token, user, done) { //token cataches token, user catches email
      console.log(user); //console logs down who requested a password recovery.
      var smtpTransport = nodemailer.createTransport({ //set up mail info
        service: 'gmail',
        auth: {
          user: 'ispydrecovery@gmail.com',
          pass: 'RizzoReac@285'
        }
      });
      var mailOptions = { //edit mailing content and receiver
        to: user.email,
        from: 'ispydrecovery@gmail.com',
        subject: 'ISPYD Account Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) { //sending the mail with the token attached link
        req.flash('err', 'An e-mail has been sent to ' + user.email + ' with further instructions.'); //flash stating completion of the email sending.
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot'); //refresh page with flash
  });
});


//This is the second part where user clicks on the link sent on the email with the token 
app.get('/reset/:token', alreadyLoggedIn, function(req,res) {
  req.session.lastPage = '/login'; //if this fails, we go back to login page.

  connection.query({ //check the owner of the token and whether it has expired. 
    sql: 'SELECT * FROM auth WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
    values: [req.params.token, Date.now()]
  }, function(err, rows) {
    //connection.end();
    if (err)
      return done(err);

    if (!rows.length)
    {
      req.flash('err', 'The link is either invalid or has expires, please try again.');
      res.redirect("/login");
    }
    else {
    // Correct user and password
        
        res.render('pages/reset', { //if link is valid, direct user to reset.ejs form where they POST new password info.
          email: rows[0].email, 
          errmsg: req.flash('err')
        });
    
    }
  });
});


app.post('/reset/:token', function(req, res) { //submitted reset form, we test the token again to see if it's expired, if not then we chage the password in mysql and redirect user back to login.
  req.session.lastPage = '/login';
  async.waterfall([
    function(done) {
      connection.query({
        sql: 'SELECT * FROM auth WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
        values: [req.params.token, Date.now()]
      }, function(err, rows) {
        //connection.end();
        if (err)
          throw err;
    
        if (!rows.length)
        {
          req.flash('err', 'The link is either invalid or has expires, please try again.');
          res.redirect("/login");
          throw err;
        }
        else {
          var user = new Object();
          user.id       = rows[0].id;
          user.email = rows[0].email;
          user.password = bcrypt.hashSync(req.body.password);
          user.name = rows[0].name;
          connection.query({
            sql: "UPDATE auth set password = ?, resetPasswordToken = null , resetPasswordExpires = null WHERE id =?",
            values: [user.password,user.id]
          }, function(err, rows) {
            if (err) throw err;
          });
          console.log("Password updated for" + user.name);
        }
        done(err,user);
      });
    },

    function(user, done) {
      console.log(user);
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ispydrecovery@gmail.com',
          pass: 'RizzoReac@285'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'ispydrecovery@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('err', 'Success! Your password has been changed, please log in with your new password.');
        done(err,'done');
      });
    }
  ], function(err) {
    res.redirect('/login');
  });
});
//-----------------------------------------------Editing Profile-------------
app.get('/edit', mustBeLoggedIn, function(req,res) {
  connection.query({
    sql: 'SELECT * FROM userInfo WHERE id = ?',
    values: [req.user.id]
  }, function(err,rows){
    if (err){
      console.log('Editing User Info Error: ' + err);
      return (err);
    }
    else {
      delete rows[0]['id'];
      console.log(rows[0]);
      let infoObj = JSON.stringify(rows[0]);
      dataLogger(req.user.id,"move","edit");
      if (!req.session.lastPage == '/signup') {
        console.log(req.session.lastPage);
        res.render('pages/edit', {
          id: req.user.id,
          page: -1,
          auth: 1,
          errmsg: req.flash('err'),
          first_time: 0,
          info: infoObj //JSON array containing all current user info
        });
      } else {
        res.render('pages/edit', {
          id: req.user.id,
          page: -1,
          auth: 1,
          errmsg: req.flash('err'),
          first_time: 1,
          info: infoObj //JSON array containing all current user info
        });
      }
    }
  });
});



app.post('/edit', function(req,res) {
  console.log(req.body.newBio);
  console.log(req.body.newOccupation);
  connection.query({
    sql:'UPDATE userInfo SET bio = ?, occupation = ?, education = ?, lives_in = ?, is_from = ?, phone = ?, public_email = ? WHERE id = ?',
    values: [req.body.newBio, req.body.newOccupation, req.body.newEducation, req.body.newLives_in, req.body.newIs_from, req.body.newPhone, req.body.newPublic_email, req.user.id]
  }, function(err, rows) {
    if (err){
      console.log('User update information into SQL POST method error: ' + err);
      return (err);
    } else {
      req.flash('err', 'Public Profile Updated Successfully');
      res.redirect('/profile');
    }

  })
});


//------------------------------------------------Change Password (this is when I am already logged in) ------------------------------------
app.get('/change_password', mustBeLoggedIn, function(req,res) {
  dataLogger(req.user.id,"move","change_password");
  res.render('pages/reset', {
    id: req.user.id,
    email: req.user.email, 
    errmsg: req.flash('err')
  })
});

app.post('/change_password', mustBeLoggedIn, function(req,res){
  hashedPassword = bcrypt.hashSync(req.body.password);


  connection.query({
    sql: "UPDATE auth set password = ?, resetPasswordToken = null , resetPasswordExpires = null WHERE id =?",
    values: [hashedPassword,req.user.id]
  }, function(err, rows) {
  if (err) throw err;
  });

  console.log("Password updated for" + req.user.name);

    req.flash('err','Password Updated!');
    res.redirect('/profile');
});

const port = process.env.PORT || 5500;
app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))
