var depositManager = require('./../../manager/deposit');

var socket_outgoing = {

};

var socket_incoming = {
  REQUEST_INVENTORY: 'DEPOSIT_OUT_REQUEST_INVENTORY',
  FORCE_INVENTORY_RELOAD: 'DEPOSIT_OUT_FORCE_INVENTORY_RELOAD'
};

module.exports = function(socket, io, _) {

  socket.on(socket_incoming.REQUEST_INVENTORY, (callback) => {
    if (!_.ensureAuthenticated(true)) {
      return callback('You must be logged in.');
    }

    depositManager.requestUserInventory(socket.request.session.passport.user, (err, inv) => {
      if (err) {
        return callback(err.message);
      }

      return callback(err, inv);
    });
  });

  socket.on(socket_incoming.FORCE_INVENTORY_RELOAD, (callback) => {
    if (!_.ensureAuthenticated(true)) {
      return callback('You must be logged in.');
    }

    return callback();//TODO
  });

}
