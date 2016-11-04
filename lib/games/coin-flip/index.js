var Coinflip = require('./../../../models/coin-flip').Coinflip;
var User = require('./../../../models/user').User;
var async = require('async');

module.exports.createGame = function(user, amount, side, callback) {
  var game = new Coinflip({
    id_creator: user._id,
    starting_face: side,
    amount: amount
  });
  game.save(function(err) {
    callback(err);
  });
}

module.exports.joinGame = function(_id, userID, callback) {
  Coinflip.findById(_id, function(err, game) {
    if (err || !game) {
      callback(new Error('Unable to find game'));
    } else {
      User.findById(userID, function(err, user) {
        if (err || !user) {
          callback(new Error('Unable to find user model'));
        } else {
          if (user.hasEnough(game.amount)) {
            user.removeCoins(game.amount, function(err) {
              if (err) {
                callback(new Error('Unable to update user balance'));
              } else {
                //TODO
              }
            });
          } else {
            callback(new Error('Insufficient credits'));
          }
        }
      });
    }
  });
}

module.exports.loadAvailableGames = function(callback) {
  Coinflip.find({ completed: false }, function(err, obj) {
    var games = [];
    var index = 0;
    async.series([
      //Load in each game into the array
      function(callback) {
        async.each(obj, function(val, callback) {
          games.push(val.toObject());
          return callback();
        }, callback);
      },
      //Update each game in the array
      function(callback) {
        async.each(games, function(val, callback) {
          async.series([
            function (callback) {
              User.findOne({ _id: val.id_creator }, function(err, user) {
                if (user) {
                  games[index].creator_name = user.name;
                  games[index].creator_photo = JSON.parse(user.photos)[0].value;
                }
                index++;
                return callback();
              });
            }
          ], callback);
        }, callback);
      }
    ], function(err) {
      return callback(err, games);
    });
  });
}
