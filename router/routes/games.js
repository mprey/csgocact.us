var express = require('express');
var router = express.Router();
var app = require('./../../app');
var Game = require('./../../models/game').Game;

router.get('/coin-flip', function(req, res) {
    res.render('coin-flip', {user: req.user});
});

router.get('/roulette', function(req, res) {

});

router.get('/crash', function(req, res) {

});

module.exports = router;
