var express = require('express');
var router = express.Router();
<<<<<<< HEAD
var app = require('./../../app');
=======
>>>>>>> 5ece4398d24ddaa7005839e2b26519c4b002ef72
var Game = require('./../../models/game').Game;

router.get('/coin-flip', function(req, res) {
  Game.find({completed: false}, function(err, obj) {
    if (err) {
      res.redirect('/')
    } else {
      res.render('games', {user: req.user, games: obj});
    }
  });
});

router.get('/roulette', function(req, res) {

});

router.get('/crash', function(req, res) {

});

module.exports = router;
