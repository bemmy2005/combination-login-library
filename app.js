var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//begin for login
var session = require("express-session");
var debug = require("debug")("app.js");
var indexRouterlogin = require("./routes/index-login");
//var usersRouter = require("./routes/users");
//var aboutRouter = require("./routes/about");
//end for
//import routes from their respective locations
var indexRouterlibrary = require('./routes/index-library');
//var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site
var compression = require('compression');
var helmet = require('helmet');

var app = express();
app.use(helmet());
//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/combination-login-library';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
//app.use(require('connect').bodyParser());//i added this
//app.use(express.bodyParser());
app.use(express.json());//login
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
//begin for loggedIn
// include bootstrap css
app.use(
  "/css",
  express.static(path.join(__dirname, "public", "3rdparty", "bootstrap", "dist", "css"))
);

// set up the session
app.use(
  session({
    secret: "app",
    name: "app",
    resave: true,
    saveUninitialized: true
    // cookie: { maxAge: 6000 } /* 6000 ms? 6 seconds -> wut? :S */
  })
);
// redirect to login form
//.use("/users", checkLoggedIn, usersRouter);
//app.use("/logout", logout, indexRouter);
//app.use("/login", login, indexRouter);
//app.use("/about", aboutRouter);
//app.use("/", checkLoggedIn, indexRouter);
//end for loggedIn
//middleware chain
app.use('/', indexRouterlibrary);//cause of login
app.use('/index-login',indexRouterlogin);
//app.use('/users', usersRouter);//cuase of login
//app.use('/users/cool', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.

// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
  debug("app.use", req.path,404);//loginh
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  debug("app.use", "ERROR", err.message);//login
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
