var Deposit = require ('../../../models/deposit').Deposit;

var socketIncoming = {
  DEPOSIT_FAILED: 'BOT_IN_DEPOSIT_FAILED',
  DEPOSIT_SUCCESS: 'BOT_IN_DEPOSIT_SUCCESS'
};

var socketOutgoing = {

};

module.exports = (socket, io, appIo, botManager) => {
  socket.on(socketIncoming.DEPOSIT_FAILED, (data) => { //data.reason, userId
    console.log(appIo.sockets.sockets[0]);
    Deposit.completeDeposit(data.userId, false, (err, doc) => {

    });
  });

  socket.on(socketIncoming.DEPOSIT_SUCCESS, (data) => { //data.offer, userId
    Deposit.completeDeposit(data.userId, true, (err, doc) => {

    })
  });
}
