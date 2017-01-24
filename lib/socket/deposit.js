var depositManager = require('./../../manager/deposit');

var socket_outgoing = {

};

var socket_incoming = {
  REQUEST_INVENTORY: 'DEPOSIT_OUT_REQUEST_INVENTORY',
  FORCE_REQUEST_INVENTORY: 'DEPOSIT_OUT_FORCE_REQUEST_INVENTORY',
  SUBMIT_DEPOSIT: 'DEPOSIT_OUT_SUBMIT_DEPOSIT'
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

  socket.on(socket_incoming.FORCE_REQUEST_INVENTORY, (callback) => {
    if (!_.ensureAuthenticated(true)) {
      return callback('You must be logged in.');
    }

    depositManager.forceInventoryReload(socket.request.session.passport.user, (err, inv) => {
      if (err) {
        return callback(err.message);
      }
      return callback(err, inv);
    });
  });

  socket.on(socket_incoming.SUBMIT_DEPOSIT, (data, callback) => { //data.items
    if (!_.ensureAuthenticated(true)) {
      return callback('You must be logged in.');
    }

    depositManager.submitDeposit(socket.request.session.passprt.user, data.items, (err, data) => {
      if (err) {
        return callback(err.message);
      }
      return callback(err, data);
    });
  });

}
