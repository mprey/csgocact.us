var User = require('./../../models/user').User;

var socket_incoming = {
  INIT: 'INIT_MAIN',
  REQUEST_UPDATE_BALANCE: 'REQUEST_UPDATE_BALANCE'
};

var socket_outgoing = {
  ALERT: 'ALERT',
  NOTIFY: 'NOTIFY',
  FORCE_RELOAD: 'FORCE_RELOAD',
  UPDATE_BALANCE: 'UPDATE_BALANCE',
  INIT: 'INIT_MAIN'
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
