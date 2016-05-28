var socketio = require('socket.io');

module.exports.listen = function(app) {
  io = socketio.listen(app);

  io.sockets.on('connection', function(socket) {
    console.log("connection with id: " + socket.id);

    socket.on('create', function(game) {

      io.emit('addgame')
    });

    socket.on('join', function(game) {
      
    });

    socket.on('withdraw', function(items) {

    });

    socket.on('deposit', function(items) {

    });

  });
}
