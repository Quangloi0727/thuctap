var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/HoaBinhStore', {useNewUrlParser: true});
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(logger('dev'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'page')));
app.use("vendor",express.static(__dirname +"/vendor"));
app.use("fonts",express.static(__dirname +"/fonts"));
app.use("media",express.static(__dirname +"/media"));
app.use('/', indexRouter);
app.use('/users', usersRouter);


var home = require('./controller/home');  
home(app);
var admin = require('./controller/admin');  
admin(app);
var product = require('./controller/product');  
product(app);
var customers = require('./controller/customers');  
customers(app);
var product_client = require('./controller/product-client');  
product_client(app);
var category = require('./controller/category');  
category(app);
var cart = require('./controller/cart');  
cart(app);
var order = require('./controller/order');  
order(app);
var news = require('./controller/new');  
news(app);
var user = require('./controller/user');  
user(app);
var deliverer = require('./controller/deliverer');  
deliverer(app);
var report_sells_product = require('./controller/report-sells-product');  
report_sells_product(app);
var report_sales_month = require('./controller/report-sales-month');  
report_sales_month(app);


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

module.exports = app;
