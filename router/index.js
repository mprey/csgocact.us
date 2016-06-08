var passport = require('passport');
var request = require('request');

var coinflip = require('./../lib/coin-flip');

module.exports = function(app) {

  /**
   *  Index route
   */
  app.get('/', function (req, res) {
    res.render('index', {user: req.user});
  });

  /**
   *  Deposit route
   */
  app.get('/deposit', ensureAuthenticated, function (req, res) {
    res.render('deposit', {user: req.user});
  });

  /**
   *  Store route
   */
  app.get('/store', ensureAuthenticated, function (req, res) {
    res.render('store', {user: req.user});
  });

  /**
   *  Profile route
   */
  app.get('/profile', ensureAuthenticated, function (req, res) {
    res.redirect('/profile/' + req.user._id);
  });

  app.get('/profile/:id', function (req, res) {
    var id = req.params.id;
    console.log('request with id: ' + id);
  });

  /**
   *  Games route
   */
  app.get('/games', function (req, res) {
    res.render('games', {user: req.user});
  });

  app.get('/games/coin-flip', ensureAuthenticated, function(req, res) {
    coinflip.loadAvailableGames(function(err, data) {
      res.render('coin-flip', {user: req.user, games: data});
    });
  });

  /**
   *  Authorization route
   */
  app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
    res.redirect('/');
  });

  app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
    res.redirect('/');
  });

  /**
   *  Logout route
   */
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  /**
   *  API route
   */
  app.get('/api/user_data', function(req, res) {
    if (req.user) {
      res.json(JSON.stringify(req.user));
    } else {
      res.json({});
    }
  });

  app.get('/api/steam_data', ensureAuthenticated, function(req, res) {
    res.redirect('/api/steam_data/' + req.user._id);
  });

  app.get('/api/steam_data/:id', function(req, res) {
    var url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + process.env.AUTH_API_KEY + "&steamids=" + req.params.id;
    request(url, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(JSON.parse(body));
      } else {
        res.redirect('/404');
        console.log("Error with steam_data API: ", error, ", status code: ", response.statusCode)
      }
    });
  });

  /**
   *  Error handling
   */
  app.get('/404', function(req, res) {
    res.status(404);
    res.render('404', {user: req.user});
  });

  app.use(function (req, res, next) {
    res.redirect('/404');
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
