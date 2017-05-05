var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Parse = require('parse/node');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieSession = require('cookie-session');
var paypal = require('paypal-rest-sdk');

var index = require('./routes/index');
var reservation = require('./routes/reservation');
var users = require('./routes/users');

// API
var carsApi = require('./routes/api/api.cars.js');
var plansApi = require('./routes/api/api.plans.js');
var usersApi = require('./routes/api/api.users.js');
var reservationApi = require('./routes/api/api.reservation.js');
var contactApi = require('./routes/api/api.contact.js');

// Parse config
Parse.initialize('', '', '');
Parse.serverURL = 'https://pg-app-ejq72d40xlbkdqicz43zy7jchd0x3y.scalabl.cloud/1/';
Parse.Cloud.useMasterKey();

// Paypal
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ATcUQSB56EuVRnpuz1cp3-64HIB9Ws5nJS1mWHjHzKECS3S3t_lEHjn5cmLmWf8CLpNbiblcl98sIEQd',
    'client_secret': 'EKJJqrf8vSGbN5DpDJMkr6azTtrRzmzte7iCzJI0BcQTtexajCYptpjFpSy6ccIeeefphucw1mLlD5pz'
});

var app = express();

// Settings
app.set('db-connection', 'mongodb://userdea6f4:82de97s9zV9c43f0483@mongodb-0a2114af55d5f9eae-eu-west-1-scalabledbs.cloudstrap.io:27003/pg-app-1-eu-ejq72d40xlbkdqicz43zy7jchd0x3y?ssl=true');
//app.set('db-connection', 'mongodb://localhost:27017/iapply');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser('D45BBE92-45EB-4147-BD6F-C60C38381691', {
    httpOnly: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
    keys: ['D45BBE92-45EB-4147-BD6F-C60C38381691'],
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log('passport...');
        Parse.User.logIn(username, password, {
            success: function(user) {
                user.fetch().then(function(r) {
                    return done(null, r);
                })
            },
            error: function(user, error) {
                return done(null, false, {
                    message: error.message
                });
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('deserialize');
    var user = Parse.Object.extend('_User');
    var query = new Parse.Query(user);
    query.get(id, {
        success: function(result) {
            console.log(result);
            done(null, result);
        },
        error: function(error) {
            done(error, null);
        }
    });
});

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.locals.req = req;
    next();
});

app.use('/', index);
app.use('/user', users);
app.use('/reservation', reservation);
app.use('/api/cars', carsApi);
app.use('/api/plans', plansApi);
app.use('/api/users', usersApi);
app.use('/api/reservation', reservationApi);
app.use('/api/contact', contactApi);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('shared/error');
});

module.exports = app;