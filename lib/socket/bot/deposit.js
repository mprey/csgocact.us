var Deposit = require ('../../../models/deposit').Deposit;
var User = require('../../../models/user').User;

var socketIncoming = {
  DEPOSIT_FAILED: 'BOT_IN_DEPOSIT_FAILED',
  DEPOSIT_SUCCESS: 'BOT_IN_DEPOSIT_SUCCESS'
};

var socketOutgoing = {
  DEPOSIT_SUCCESS: 'DEPOSIT_IN_DEPOSIT_SUCCESS',
  DEPOSIT_FAILED: 'DEPOSIT_IN_DEPOSIT_FAILED',
  ADD_CREDITS: 'ADD_CREDITS'
};

function findSocket(io, id) {
  for (var index in io.sockets.connected) {
    var socket = io.sockets.connected[index];
    if (socket.request.session && socket.request.session.passport && socket.request.session.passport.user == id) {
      return socket;
    }
  }
}

module.exports = (socket, io, appIo, botManager) => {
  socket.on(socketIncoming.DEPOSIT_FAILED, (data) => { //data.reason, userId
    var userSocket = findSocket(appIo, data.userId);
    Deposit.completeDeposit(data.userId, false, (err, doc) => {
      if (userSocket) {
        userSocket.emit(socketOutgoing.DEPOSIT_FAILED, {
          reason: data.reason
        });
      }
    });
  });

  socket.on(socketIncoming.DEPOSIT_SUCCESS, (data) => { //data.offer, userId
    var userSocket = findSocket(appIo, data.userId);
    Deposit.completeDeposit(data.userId, true, (err, doc) => {
      if (err || !doc) {
        if (userSocket) {
          userSocket.emit(socketOutgoing.DEPOSIT_FAILED, {
            reason: 'databaseError'
          });
        }
        return;
      }
      User.updateUserBalance(data.userId, doc.amount, (err, user) => {
        if (err || !user) {
          if (userSocket) {
            userSocket.emit(socketOutgoing.DEPOSIT_FAILED, {
              reason: 'databaseError'
            });
          }
          return;
        }
        if (userSocket) {
          userSocket.emit(socketOutgoing.DEPOSIT_SUCCESS, {
            amount: doc.amount
          });
          userSocket.emit(socketOutgoing.ADD_CREDITS, {
            added: doc.amount,
            balance: user.credits
          });
        }
      });
    })
  });
}
