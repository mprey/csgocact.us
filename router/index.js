var passport = require('passport');
var request = require('request');

module.exports = function(app) {

  /*
  index route
  */
  app.get('/', function (req, res) {
    res.render('index', {user: req.user});
  });

  /*
  deposit route
  */
  app.get('/deposit', ensureAuthenticated, function (req, res) {
    res.render('deposit', {user: req.user});
  });

  /*
  store route
  */
  app.get('/store', ensureAuthenticated, function (req, res) {
    res.render('store', {user: req.user});
  });

  /*
  profile route
  */
  app.get('/profile', ensureAuthenticated, function (req, res) {
    res.redirect('/profile/' + req.user._id);
  });

  app.get('/profile/:id', function (req, res) {
    var id = req.params.id;
    console.log('request with id: ' + id);
  });

  /*
  games route
  */
  app.get('/games', function (req, res) {
    res.render('games', {user: req.user});
  });

  app.get('/games/coin-flip', ensureAuthenticated, function(req, res) {
      res.render('coin-flip', {user: req.user});
  });

  /*
  auth route
  */
  app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
    res.redirect('/');
  });

  app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
    res.redirect('/');
  });

  /*
  logout route
  */
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  /*
  api route
  */
  app.get('/api/user_data', function(req, res) {
    if (req.user) {
      res.json(JSON.stringify(req.user));
    } else {
      res.json({});
    }
  });

  app.get('/api/steam_data', function(req, res) {
    if (req.user) {
      res.redirect('/api/steam_data/' + req.user._id);
    } else {
      res.redirect('/404');
    }
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

  /*
  error catching
  */
  app.get('/404', function(req, res) {
    res.status(404);
    res.render('404', {user: req.user});
  });

  app.use(function (req, res, next) {
    res.redirect('/404');
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    var error = encodeURIComponent('You must be logged in to view that page.');
    res.redirect('/?error=' + error);
  }
}
