var express = require('express');
<<<<<<< HEAD
var router = express.Router();
var passport = require('passport');
=======
var passport = require('passport');
var router = express.Router();
>>>>>>> 5ece4398d24ddaa7005839e2b26519c4b002ef72

router.get('/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

module.exports = router;
