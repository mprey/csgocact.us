require('dotenv').config();
require('./lib/db');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;

var Game = require('./models/game').Game;
var User = require('./models/user').User;

var game = new Game({
  id_creator: "5",
  amount: 10
});

game.save(function(err) {
  console.log(err);
});

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log(obj);
  done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: process.env.AUTH_RETURN,
    realm: process.env.AUTH_REALM,
    apiKey: process.env.AUTH_API_KEY,
    profile: true,
    stateless: true
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      console.log(identifier);
      console.log(profile);
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
  secret: 'secret', //TODO save in process
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

console.log(process.env);

/*app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/games/coin-flip', function(req, res) {
  Game.find({completed: false}, function(err, obj) {
    if (err) {
      res.redirect('/')
    } else {
      res.render('games', {user: req.user, games: obj});
    }
  });
});

app.get('')

app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });
}*/

module.exports = {
  App: app,
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
};
