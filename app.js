if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');


const initializePassport = require('./passport-config')
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
 )

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

 const users = []

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


// app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hello', usersRouter);
app.get('/hi', function (req, res) {
  res.send('Hello World!')
})
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name})
})
app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.post('/register', async (req, res) => {
  try {
const hashedPassword = await bcrypt.hash(req.body.password, 10)
users.push({
  id:Date.now().toString(),
  name: req.body.name,
  email: req.body.email,
  password: hashedPassword
})
res.redirect('/login')
  }  catch {
res.redirect('/register')
  }
console.log(users)
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    return next()
  }

  res.redirect('/login')
}

module.exports = app;


// minute 22:56