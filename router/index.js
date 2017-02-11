var passport = require('passport');
var request = require('request');

module.exports = function(app) {

  /**
   *  Index route
   */
  app.get('/', function (req, res) {
    res.redirect('/coinflip');
  });

  /**
   *  Withdraw route
   */
  app.get('/withdraw', function (req, res) {
    res.render('layout', {
      user: req.user,
      title: 'Withdraw',
      content: 'withdraw.ejs'
    });
  });

  app.get('/support', function(req, res) {
    res.render('layout', {
      user: req.user,
      title: 'Support',
      content: 'support.ejs'
    });
  });

  app.get('/provably-fair', function(req, res) {
    res.render('layout', {
      user: req.user,
      title: 'Provably Fair',
      content: 'provably-fair.ejs'
    });
  });

  app.get('/coinflip', function(req, res) {
    res.render('layout', {
      user: req.user,
      title: 'Coinflip',
      content: 'coin-flip.ejs',
      js_file: 'coinflip.js'
    });
  });

  app.get('/roulette', function(req, res) {
    res.render('layout', {
      user: req.user,
      title: 'Roulette',
      content: 'roulette.ejs'
    });
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

  /**
   * Verification route
   */
   app.get('/zohoverify/verifyforzoho.html', (req, res) => {
     res.end('1486734653587');//hi
   });

  app.get('/error', function(req, res) {
    res.send(req.params.error);
  });

  app.use(function(req, res, next) {
    res.status(404);
    res.render('layout', {
      title: '404 Error',
      content: '404.ejs'
    });
  });

  /**
   *  Utility functions
   */
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/nologin');
  }
}
