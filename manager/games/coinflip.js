var Coinflip = require('./../../models/coin-flip').Coinflip;
var User = require('./../../models/user').User;
var config = require('../../config').coinflip;
var md5 = require('blueimp-md5');
var async = require('async');

var socket_outgoing = {
  COINFLIP_INIT: 'COINFLIP_IN_INIT_COINFLIP',
  PROMO_CODE_END: 'PROMO_CODE_END',
  COINFLIP_USER_HISTORY_DATA: 'COINFLIP_IN_USER_HISTORY_DATA',
  COINFLIP_ADD_GAME: 'COINFLIP_IN_ADD_GAME',
  REMOVE_CREDITS: 'REMOVE_CREDITS',
  COINFLIP_UPDATE_GAME: 'COINFLIP_IN_UPDATE_GAME',
  COINFLIP_UPDATE_GLOBAL_HISTORY: 'COINFLIP_IN_UPDATE_GLOBAL_HISTORY',
  COINFLIP_UPDATE_USER_HISTORY: 'COINFLIP_IN_UPDATE_USER_HISTORY',
  COINFLIP_UPDATE_LEADERBOARDS: 'COINFLIP_IN_UPDATE_LEADERBOARDS',
  COINFLIP_UPDATE_TOTAL_WAGERED: 'COINFLIP_IN_UPDATE_TOTAL_WAGERED',
  ADD_CREDITS: 'ADD_CREDITS'
};

var socket_incoming = {
  COINFLIP_INIT: 'COINFLIP_OUT_INIT_COINFLIP',
  REQUEST_PROMO_CODE: 'REQUEST_PROMO_CODE',
  COINFLIP_REQUEST_CURRENT_GAMES: 'COINFLIP_OUT_REQUEST_CURRENT_GAMES',
  COINFLIP_CREATE_GAME: 'COINFLIP_OUT_CREATE_GAME',
  COINFLIP_JOIN_GAME: 'COINFLIP_OUT_JOIN_GAME',
};

var updateType = {
  IN_PROGRESS: 1,
  COMPLETED: 2
};

var _this;

function CoinflipManager() {
  _this = this;

  this.init();
  this.disabled = false;
  this.disabledReason = '';

  this.currentGames = [];
  this.historyGames = [];
  this.leaderboards = [];
  this.userHistoryCache = {};

  this.totalTax = 0.00;

  this.totalWagered = 0.00;
}

CoinflipManager.prototype.init = function() {
  this.loadData();
}

CoinflipManager.prototype.toggledDisabled = function(toggle, reason) {
  this.disabled = toggle;
  this.disabledReason = reason;
}

CoinflipManager.prototype.isDisabled = function() {
  return this.disabled;
}

CoinflipManager.prototype.getGame = function(gameId, callback) {
  return Coinflip.findById(gameId, callback);
}

CoinflipManager.prototype.userHasCachedGame = function(userId, gameId) {
  if (_this.userHistoryCache.hasOwnProperty(userId)) {
    for (var index in _this.userHistoryCache[userId]) {
      var game = _this.userHistoryCache[userId][index];
      if (game._id == gameId) {
        return true;
      }
    }
  }
}

CoinflipManager.prototype.createGame = function(user, amount, side, callback) {
  var game = new Coinflip({
    id_creator: user._id,
    starting_face: side,
    amount: amount,
    hash_code: md5(Math.random().toString(36).slice(2))
  });
  game.save(function(err) {
    var temp = game.toObject();
    temp.creator_name = user.name;
    temp.creator_img = user.photo;
    _this.currentGames.push(temp);
    callback(err, temp);
  });
}

CoinflipManager.prototype.joinGame = function(game, joiner, socketHelper, io, callback) {
  if (game.completed == true || game.id_winner) {
    return callback('Game already completed');
  }

  if (game.id_creator == joiner._id) {
    return callback('Cannot join your own game');
  }

  game.id_joiner = joiner._id;
  game.completed = true;
  game.date_completed = new Date();

  var heads = Math.random() < 0.5; //TODO incorporate provably fair

  if (heads && game.starting_face == 0) {
    game.winning_face = 0;
    game.id_winner = game.id_creator;
  } else if (!heads && game.starting_face == 1) {
    game.winning_face = 1;
    game.id_winner = game.id_creator;
  } else {
    game.id_winner = game.id_joiner;
    game.winning_face = heads ? 0 : 1;
  }

  User.findById(game.id_creator, function(err, creator) {
    if (err || !creator) {
      return callback(err.message);
    }

    game.save(function(err) {
      if (err) {
        return callback(err.message);
      }

      var gameObj = game.toObject();

      gameObj.joiner_name = joiner.name;
      gameObj.joiner_img = joiner.photo;
      gameObj.creator_name = creator.name;
      gameObj.creator_img = creator.photo;

      var tax = game.amount * config.gameTax;

      var creditsEarned = Number(game.amount * 2 - tax).toFixed(2);

      _this.totalTax += tax;

      if (game.id_creator == game.id_winner) {
        gameObj.winner_name = gameObj.creator_name;
        gameObj.winner_img = gameObj.creator_img;
      } else {
        gameObj.winner_name = gameObj.joiner_name;
        gameObj.winner_img = gameObj.joiner_img;
      }

      io.emit(socket_outgoing.COINFLIP_UPDATE_GAME, {
        game: gameObj,
        type: updateType.IN_PROGRESS
      });

      callback();

      User.addAmountWagered(game.id_creator, game.amount);
      User.addAmountWagered(game.id_joiner, game.amount);

      setTimeout(function() {
        if (game.id_creator == game.id_winner) {
          User.updateUserBalance(game.id_creator, creditsEarned, function(err, doc) {
            var creatorSocket = socketHelper.findSocket(game.id_creator);
            if (!err && creatorSocket && doc) {
              creatorSocket.emit(socket_outgoing.ADD_CREDITS, {
                added: creditsEarned,
                balance: doc.credits
              });
            } else if (creatorSocket) {
              creatorSocket.emit(socket_outgoing.ALERT, {
                header: 'User Error',
                type: 'error',
                message: 'Unable to update user balance.'
              });
            }
          });
        } else if (game.id_joiner == game.id_winner) {
          User.updateUserBalance(game.id_joiner, creditsEarned, function(err, doc) {
            var joinerSocket = socketHelper.findSocket(game.id_joiner);
            if (!err && joinerSocket && doc) {
              joinerSocket.emit(socket_outgoing.ADD_CREDITS, {
                added: creditsEarned,
                balance: doc.credits
              });
            } else if (joinerSocket) {
              joinerSocket.emit(socket_outgoing.ALERT, {
                header: 'User Error',
                type: 'error',
                message: 'Unable to update user balance.'
              });
            }
          });
        }
        _this.updateHistory(gameObj, io, socketHelper);
        io.emit(socket_outgoing.COINFLIP_UPDATE_GAME, {
          game: gameObj,
          type: updateType.COMPLETED
        });
      }, 10 * 1000); //wait 10 seconds to update the game so the client-side coinflip can take place
    });
  });
}

CoinflipManager.prototype.updateHistory = function(gameObj, io, socketHelper) {
  /* Update the global history and total wagered for client-side */
  _this.appendGlobalHistory(io, gameObj);

  /* Update the user history for the two players */
  _this.appendUserHistory(gameObj.id_creator, gameObj, socketHelper);
  _this.appendUserHistory(gameObj.id_joiner, gameObj, socketHelper);

  /* Update the global leaderboards */
  _this.updateLeaderboards(io, gameObj);

  /* Remove current game from array */
  _this.removeCurrentGame(gameObj);
}

CoinflipManager.prototype.removeCurrentGame = function(current) {
  for (var index in _this.currentGames) {
    var game = _this.currentGames[index];
    if (game._id == current._id) {
      _this.currentGames.splice(index, 1);
      return;
    }
  }
}

CoinflipManager.prototype.updateLeaderboards = function(io, testGame) {
  for (var index in _this.leaderboards) {
    var game = _this.leaderboards[index];
    if (testGame.amount >= game.amount) {
      _this.leaderboards.splice(index, 0, testGame);
      if (_this.leaderboards.length > config.leaderboardLength) {
        _this.leaderboards.length = config.leaderboardLength;
      }
      io.emit(socket_outgoing.COINFLIP_UPDATE_LEADERBOARDS, {
        leaderboards: _this.leaderboards
      });
      return;
    }
  }
}

CoinflipManager.prototype.appendGlobalHistory = function(io, game) {
  _this.historyGames.unshift(game);
  if (_this.historyGames.length > config.maxGlobalHistory) {
    _this.historyGames.length = config.maxGlobalHistory;
  }
  io.emit(socket_outgoing.COINFLIP_UPDATE_GLOBAL_HISTORY, {
    global_history: _this.historyGames
  });

  _this.totalWagered = _this.totalWagered + Number(game.amount);
  io.emit(socket_outgoing.COINFLIP_UPDATE_TOTAL_WAGERED, {
    total_wagered: _this.totalWagered
  });
}

CoinflipManager.prototype.appendUserHistory = function(userId, game, socketHelper) {
  var gameClone = clone(game);

  gameClone.won = (game.id_winner == userId);

  if (_this.userHistoryCache.hasOwnProperty(userId) && !_this.userHasCachedGame(userId, game._id)) {
    var array = _this.userHistoryCache[userId];
    array.unshift(gameClone);
    if (array.length > config.maxUserHistory) {
      array.length = config.maxUserHistory;
    }
    _this.userHistoryCache[userId] = array;

    var userSocket = socketHelper.findSocket(userId);
    if (userSocket) {
      userSocket.emit(socket_outgoing.COINFLIP_UPDATE_USER_HISTORY, {
        user_history: _this.userHistoryCache[userId]
      });
    }
  }
}

CoinflipManager.prototype.loadUserHistory = function(userId, done) {
  if (_this.userHistoryCache.hasOwnProperty(userId)) {
    return done(_this.userHistoryCache[userId]);
  } else {
    Coinflip.getUserHistory(userId, config.maxUserHistory, function(err, obj) {
      var games = [];
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
            User.findOne({ _id: val.id_creator }, function(err, user) {
              if (user) {
                val.creator_name = user.name;
                val.creator_img = user.photo;
              }
              if (userId == val.id_creator) {
                val.won = (userId == val.id_winner);
              }
              User.findOne({ _id: val.id_joiner }, function(err, user1) {
                if (user) {
                  val.joiner_name = user1.name;
                  val.joiner_img = user1.photo;
                }
                if (userId == val.id_joiner) {
                  val.won = (userId == val.id_winner);
                }
                if (val.id_winner == val.id_creator) {
                  val.winner_name = user.name;
                  val.winner_img = user.photo;
                } else {
                  val.winner_name = user1.name;
                  val.winner_img = user1.photo;
                }
                callback();
              });
            });
          }, callback);
        }
      ], function(err) {
        if (err) {
          console.log('Coinflip - Error while loading user history: ' + err.message);
          return done();
        }
        _this.userHistoryCache[userId] = games;
        return done(_this.userHistoryCache[userId]);
      });
    });
  }
}

CoinflipManager.prototype.loadData = function() {
  Coinflip.getRecentGames(config.maxGlobalHistory, function(err, obj) {
    var games = [];
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
          User.findOne({ _id: val.id_creator }, function(err, user) {
            if (user) {
              val.creator_name = user.name;
              val.creator_img = user.photo;
            }
            User.findOne({ _id: val.id_joiner }, function(err, user1) {
              if (user) {
                val.joiner_name = user1.name;
                val.joiner_img = user1.photo;
                if (val.id_winner == val.id_creator) {
                  val.winner_name = user.name;
                  val.winner_img = user.photo;
                } else {
                  val.winner_name = user1.name;
                  val.winner_img = user1.photo;
                }
              }
              return callback();
            });
          });
        }, callback);
      }
    ], function(err) {
      console.log('Coinflip - loaded ' + games.length + ' history games from the database');
      _this.historyGames = games;
    });
  });
  Coinflip.getOpenGames(function(err, obj) {
    var games = [];
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
          User.findOne({ _id: val.id_creator }, function(err, user) {
            if (user) {
              val.creator_name = user.name;
              val.creator_img = user.photo;
            }
            callback();
          });
        }, callback);
      }
    ], function(err) {
      console.log('Coinflip - loaded ' + games.length + ' open games from the database');
      _this.currentGames = games;
    });
  });
  Coinflip.find({ completed: true }).sort('-amount').limit(5).exec(function(err, values) {
    if (!err && values) {
      async.each(values, function(val, callback) {
        var game = val.toObject();
        User.findById(game.id_winner, function(err, user) {
          if (user) {
            game.winner_name = user.name;
            game.winner_img = user.photo;
            _this.leaderboards.push(game);
          }
          callback();
        });
      }, function() {
        _this.leaderboards.sort(function(a, b) {
          if (a.amount < b.amount) {
            return 1;
          } else if (a.amount > b.amount) {
            return -1;
          }
          return 0;
        });
      });
    } else {
      console.log('Coinflip - error while loading leaderboards: ' + err.message);
    }
  });
  Coinflip.find({ completed: true }).select('amount -_id').exec(function(err, values) {
    if (!err && values) {
      for (var index in values) {
        var game = values[index];
        _this.totalWagered += game.amount;
      }
    } else {
      console.log('Coinflip - error while loading total wagered: ' + err.message);
    }
  });
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

var coinflipManager = new CoinflipManager();

module.exports = coinflipManager;
