var Coinflip = require('./../../../models/coin-flip').Coinflip;
var User = require('./../../../models/user').User;
var async = require('async');

var disabled = false;
var disabledReason = '';

var currentGames = [];

var historyGames = []; //CAPS AT 50

var userHistoryCache = {};

var MAX_HISTORY_AMOUNT = 50;

function CoinflipManager() {
  this.init();
  this.disabled = false;
  this.disabledReason = '';
}

CoinflipManager.prototype.init = function() {
  this.loadGamesFromDatabase();
};

CoinflipManager.prototype.toggledDisabled = function(toggle, reason) {
  this.disabled = toggle;
  this.disabledReason = reason;
};

CoinflipManager.prototype.isDisabled = function() {
  return this.disabled;
};

CoinflipManager.prototype.createGame = function(userId, amount, side, callback) {
  var game = new Coinflip({
    id_creator: user._id,
    starting_face: side,
    amount: amount
  });
  //TODO add the creator_name and creator_photo to the attached object
  this.currentGames.push(game);
  game.save(function(err) {
    callback(err);
  });
};

CoinflipManager.prototype.joinGame = function(_id, userId, callback) {
  //TODO OPTIMIZE
  Coinflip.findById(_id, function(err, game) {
    if (err || !game) {
      return callback(new Error('Unable to find coinflip game in the database.'));
    } else {
      User.findById(userId, function(err, user) {
        if (err || !user) {
          return callback(new Error('Unable to find user model.'));
        } else {
          if (user.hasEnough(game.amount)) {
            user.removeCoins(game.amount, function(err) {
              if (err) {
                return callback(new Error('Unable to update user balance.'));
              } else {
                //successful
                return callback();
              }
            });
          } else {
            return callback(new Error('You need ' + game.amount + ' credits to join this game!'));
          }
        }
      });
    }
  });
};

CoinflipManager.prototype.loadUserHistory = function(userId, done) {
  if (userHistoryCache.hasOwnProperty(userId)) {
    done(userHistoryCache.userId);
  } else {
    Coinflip.getUserHistory(userId, MAX_HISTORY_AMOUNT, function(err, obj) {
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
                    games[index].creator_photo = user.photo;
                  }
                  User.findOne({ _id: val.id_joiner }, function(err, user1) {
                    if (user) {
                      games[index].joiner_name = user1.name;
                      games[index].joiner_photo = user1.photo;
                    }
                    index++;
                    return callback();
                  });
                });
              }
            ], callback);
          }, callback);
        }
      ], function(err) {
        userHistoryCache.userId = games;
        done(userHistoryCache.userId);
      });
    });
  }
};

CoinflipManager.prototype.loadGamesFromDatabase = function() {
  Coinflip.getRecentGames(MAX_HISTORY_AMOUNT, function(err, obj) {
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
                  games[index].creator_photo = user.photo;
                }
                User.findOne({ _id: val.id_joiner }, function(err, user1) {
                  if (user) {
                    games[index].joiner_name = user1.name;
                    games[index].joiner_photo = user1.photo;
                  }
                  index++;
                  return callback();
                });
              });
            }
          ], callback);
        }, callback);
      }
    ], function(err) {
      this.historyGames = games;
    });
  });
  Coinflip.getOpenGames(function(err, obj) {
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
                  games[index].creator_photo = user.photo;
                }
                index++;
                return callback();
              });
            }
          ], callback);
        }, callback);
      }
    ], function(err) {
      this.currentGames = games;
    });
  });
};

var coinflipManager = new CoinflipManager();

module.exports = coinflipManager;
