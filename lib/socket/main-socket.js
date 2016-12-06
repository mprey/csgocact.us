var User = require('./../../models/user').User;
var PromoCode = require('./../../models/promo-code').PromoCode;

var socket_incoming = {
  INIT: 'INIT_MAIN',
  REQUEST_UPDATE_BALANCE: 'REQUEST_UPDATE_BALANCE',
  REQUEST_PROMO_CODE: 'REQUEST_PROMO_CODE'
};

var socket_outgoing = {
  ALERT: 'ALERT',
  NOTIFY: 'NOTIFY',
  FORCE_RELOAD: 'FORCE_RELOAD',
  UPDATE_BALANCE: 'UPDATE_BALANCE',
  INIT: 'INIT_MAIN',
  ADD_CREDITS: 'ADD_CREDITS',
  REMOVE_CREDITS: 'REMOVE_CREDITS',
  PROMO_CODE_END: 'PROMO_CODE_END'
};

var ranks = {
  NORMAL: 0,
  MOD: 1,
  ADMIN: 2,
  DEVELOPER: 3,
  BOT: 4
};

module.exports = function(socket, io, _) {

  socket.on(socket_incoming.INIT, function() {
    if (_.ensureAuthenticated(true)) {
      _.getUser(function(user) {
        if (user) {
          socket.emit(socket_outgoing.INIT, {
            balance: user.credits.toFixed(2)
          });
        }
      });
    }
  });

  socket.on(socket_incoming.REQUEST_PROMO_CODE, function(data) { //data.code
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (!user) {
          _.sendError('User Error', 'Error while loading user profile. Please relogin.');
          return;
        }

        if (!user.hasEnteredPromoCode()) {
          PromoCode.getPromoCode(data.code, function(code) {
            if (code) {
              if (!code.isExpired()) {
                user.addCoins(code.amount, function(err) {
                  if (!err) {
                    socket.emit(socket_outgoing.ADD_CREDITS, {
                      added: code.amount,
                      balance: user.credits
                    });
                    user.enterPromoCode();
                  } else {
                    _.sendError('User Balance', 'Unable to add coins to user balance: ' + err.message);
                  }
                });
              } else {
                _.sendError('Promo Code', 'The promotion code ' + data.code + ' has expired.');
              }
            } else {
              _.sendError('Promo Code', 'Unable to find promo code: ' + data.code);
            }
          });
        } else {
          _.sendError('Promo Code', 'You have already entered a promotion code.');
        }
      });
    }
    socket.emit(socket_outgoing.PROMO_CODE_END);
  });

  socket.on(socket_incoming.REQUEST_UPDATE_BALANCE, function() {
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user) {
          socket.emit(socket_outgoing.UPDATE_BALANCE, {
            balance: user.credits.toFixed(2)
          });
        }
      });
    }
  });

}
