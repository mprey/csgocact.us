var socketio = require('socket.io');
var Coinflip = require('./../models/coinflip').Coinflip;
var usercount = require('./usercount');

module.exports.listen = function(app) {
  io = socketio.listen(app);

  io.sockets.on('connection', function(socket) {
    console.log("connection with id: " + socket.id);
    usercount.incrementCount();

    /*
    Coin flip handling
    */
    socket.on('join coin-flip', function(id) {
      if (!socket.user) {

      }
    });

    socket.on('create coin-flip', function(data) {
      if (!socket.user) {

      }
    });

    socket.on('request coin-flips', function() {
      Coinflip.find({completed: false}, function(err, obj) {
        socket.emit('send coin-flips', {games: obj});
      });
    });

    socket.on('request profile', function(id) {

    });

    /*
    Disconnect handling
    */
    socket.on('disconnect', function() {
      console.log("disconnect with id: " + socket.id);
      usercount.decreaseCount();
    });

  });
}
