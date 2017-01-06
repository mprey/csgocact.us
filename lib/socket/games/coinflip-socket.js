var coinflipManager = require('./../../../manager/games/coinflip-manager');

var socket_outgoing = {
  COINFLIP_INIT: 'COINFLIP_IN_INIT_COINFLIP',
  PROMO_CODE_END: 'PROMO_CODE_END',
  COINFLIP_USER_HISTORY_DATA: 'COINFLIP_IN_USER_HISTORY_DATA',
  COINFLIP_ADD_GAME: 'COINFLIP_IN_ADD_GAME',
  REMOVE_CREDITS: 'REMOVE_CREDITS',
  COINFLIP_UPDATE_GAME: 'COINFLIP_IN_UPDATE_GAME'
};

var socket_incoming = {
  COINFLIP_INIT: 'COINFLIP_OUT_INIT_COINFLIP',
  REQUEST_PROMO_CODE: 'REQUEST_PROMO_CODE',
  COINFLIP_REQUEST_CURRENT_GAMES: 'COINFLIP_OUT_REQUEST_CURRENT_GAMES',
  COINFLIP_CREATE_GAME: 'COINFLIP_OUT_CREATE_GAME',
  COINFLIP_JOIN_GAME: 'COINFLIP_OUT_JOIN_GAME'
};

var MIN_BET = 0.50;
var MAX_BET = 400.00;

module.exports = function(socket, io, _) {

  socket.on(socket_incoming.COINFLIP_INIT, function() { //data.online, data.total_wagered, data.games, data.history, data.leaderboards
    var data = {};

    data.online = Object.keys(io.sockets.sockets).length;
    data.total_wagered = coinflipManager.totalWagered;
    data.games = coinflipManager.currentGames;
    data.history = coinflipManager.historyGames;
    data.leaderboards = coinflipManager.leaderboards;

    if (_.ensureAuthenticated(true)) {
      coinflipManager.loadUserHistory(socket.request.session.passport.user, function(data) {
        if (data) {
          socket.emit(socket_outgoing.COINFLIP_USER_HISTORY_DATA, {
            user_history: data
          });
        }
      });
    }

    socket.emit(socket_outgoing.COINFLIP_INIT, data);
  });

  socket.on(socket_incoming.COINFLIP_JOIN_GAME, function(data, callback) {
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (!user) {
          _.sendError('User Error', 'Error while loading user profile. Please relogin.');
          return;
        }

        console.log('USER ' + user.name + ' IS TRYING TO JOIN GAME: ', data.game_id);

        coinflipManager.getGame(data.game_id, function(err, game) {
          if (err || !game) {
            return callback(err.message);
          }

          if (user.hasEnough(game.amount)) {
            user.removeCredits(game.amount, function(err) {
              if (!err) {
                socket.emit(socket_outgoing.REMOVE_CREDITS, {
                  balance: user.credits
                });
                coinflipManager.joinGame(game, user, _, io, callback);
              } else {
                return callback(err.message);
              }
            });
          } else {
            return callback('Insufficient balance');
          }
        });
      });
    }
  });

  socket.on(socket_incoming.COINFLIP_CREATE_GAME, function(data, callback) {
    if (_.ensureAuthenticated(true)) {
      _.getUser(function(user) {
        if (!user) {
          return callback('Error while loading user profile. Please relogin.');
        }
        if (!(data.amount >= MIN_BET && data.amount <= MAX_BET)) {
          return callback('Bet is not within ' + MIN_BET + ' and ' + MAX_BET + ' bounds');
        }

        if (user.hasEnough(data.amount)) { //check if enough, try to add game to coinflipmanager, remove coins, broadcast new game, callback the game
          user.removeCredits(data.amount, function(err) {
            if (!err) {
              socket.emit(socket_outgoing.REMOVE_CREDITS, {
                balance: user.credits
              });
              coinflipManager.createGame(user, data.amount, data.side, function(err, game) {
                if (!err) {
                  socket.broadcast.emit(socket_outgoing.COINFLIP_ADD_GAME, {
                    game: game
                  });
                  return callback(err, game);
                } else {
                  return callback(err.message);
                }
              });
            } else {
              return callback(err.message);
            }
          });
        } else {
          return callback('Insufficient balance');
        }
      });
    } else {
      return callback('You are not logged in. Please login to continue.');
    }
  });

  socket.on(socket_incoming.COINFLIP_REQUEST_CURRENT_GAMES, function(callback) {
    return callback({
      games: coinflipManager.currentGames
    });
  });

}
