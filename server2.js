if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
 
const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();
const { name } = require('ejs');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const User = require('./models/users')
const Annotation = require('./models/annotations')
const ejsLint = require('ejs-lint');

const ejs = require('ejs');
let users = []

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)


app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use('/images',  express.static(__dirname + '/images'));
app.set('view engine', 'ejs'); 

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

// simple route
/*
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ISPYD." });
});
*/

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })
  
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
/*
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
*/

app.post('/login', checkNotAuthenticated, async (req, res) => {
    let user
    try {
      console.log('trying to login',req,req.body.email)
      user = await User.findByEmail(req.body.email)
            
      res.user = user
        //const user = User.assignUser(email)
      console.log(user)
      if (user === null) {
        console.log('No user with that email')
      }

    
      if (await bcrypt.compare(req.body.password, user.password)) {
        //return done(null, user)
        res.redirect('/')
      } else {
        //return done(null, false, { message: 'Password incorrect' })
        res.json( { message: 'Password incorrect' })
      }
    } catch (err) {
        res.status(500).json( { message: err.message })
    }
  })

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})
  
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        const newUser = await User.create(user)
        //res.status(201).json(newUser)
        res.redirect('/annotate')
    } catch {
      res.redirect('/register')
    }
  });

  const data = []

  app.get('/annotate',  checkNotAuthenticated, async (req, res) => {
    const html = await ejs.renderFile('./views/annotate.ejs', data, {async: true});
    res.send(html);
})
  
app.post('/annotate', checkNotAuthenticated, async (req, res) => {
  console.log(req)
  try {
    const annotation = new Annotation({
      image_id: req.body.image_id,
      user_id: req.body.user_id,
      label: req.body.annotation,
      x: req.body.x,
      y: req.body.y,
      width: req.body.width,
      height: req.body.height
    })
    const newAnnotation = await Annotation.create(annotation)
    //res.status(201).json(newAnnotation)
    console.log('Annotation Created')
    res.redirect('/annotate')
  } catch {
    console.log('ERROR WHILE CREATING Annotation')
      res.status(400).json({ message: err.message })
    }
  });

  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  


require("./routes/users.js")(app);
require("./routes/annotations.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});