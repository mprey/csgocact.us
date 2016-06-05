require('dotenv').config();
require('./lib/db');

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;
var User = require('./models/user').User;
var Coinflip = require('./models/coinflip').Coinflip;

var c = new Coinflip({
  id_creator: "76561198123588820",
  amount: 5
});

c.save(function(err) {

});

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(obj, done) {
  User.findById(obj, function (err, user) {
    done(err, user);
  });
});

passport.use(new SteamStrategy({
    returnURL: process.env.AUTH_RETURN,
    realm: process.env.AUTH_REALM,
    apiKey: process.env.AUTH_API_KEY
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      var id = identifier.match(/\d+$/)[0];
      User.findById(id, function (err, user) {
        if (err) {
          return done(err, null);
        } else if (user) {
          return done(err, user);
        } else {
          var newUser = new User({_id: id});
          newUser.save(function (err1) {
            return done(err1, newUser);
          });
        }
      });
    });
  }
));

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'CSGOExtreme Verification Cookie',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

var router = require('./router/index')(app);

module.exports = app;
