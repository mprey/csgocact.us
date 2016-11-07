var passport = require('passport');
var request = require('request');

var coinflip = require('./../lib/games/coin-flip');

module.exports = function(app) {

  /**
   *  Index route
   */
  app.get('/', function (req, res) {
    res.redirect('/coinflip');
  });

  /**
   *  Deposit route
   */
  app.get('/deposit', function (req, res) {
    res.render('deposit', {user: req.user});
  });

  /**
   *  Withdraw route
   */
  app.get('/withdraw', function (req, res) {
    res.render('withdraw', {user: req.user});
  });

  app.get('/support', function(req, res) {
    res.render('support', {user: req.user});
  });

  app.get('/provably-fair', function(req, res) {
    res.render('provably-fair', {user: req.user});
  });

  app.get('/coinflip', function(req, res) {
    res.render('coin_flip', {user: req.user});
  });

  app.get('/roulette', function(req, res) {
    res.render('roulette', {user: req.user});
  });

  /**
   *  Authorization route
   */
  app.get('/auth/steam', passport.authenticate('steam', {
    failureRedirect: '/'
  }), function(req, res) {
    res.redirect('/');
  });

  app.get('/auth/steam/return', passport.authenticate('steam', {
    failureRedirect: '/'
  }), function(req, res) {
    res.redirect('/');
  });

  /**
   *  Logout route
   */
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
  });

  /**
   *  Utility functions
   */
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    var error = encodeURIComponent('You must be logged in to view that page.');
    res.redirect('/?error=' + error);
  }
}
