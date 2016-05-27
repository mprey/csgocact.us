var socketio = require('socket.io');

module.exports.listen = function(app) {
  io = socketio.listen(app);

  io.sockets.on('connection', function(socket) {
    console.log("connection with id: " + socket.id);
  });
}
