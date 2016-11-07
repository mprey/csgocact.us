var socket_outgoing = {
  ALERT: 'ALERT'
}

function SocketHelper() {}

SocketHelper.prototype.ensureAuthenticated = function(socket) {
  if (socket.request.session.passport.user) {
    return true;
  } else {
    socket.emit(socket_outgoing.ALERT, {
      header: 'User Error',
      message: 'You are not logged in. Please sign in before continuing.',
      type: 'error'
    });
    return false;
  }
}

SocketHelper.prototype.sendError = function(socket, header, message) {
  socket.emit(socket_outgoing.ALERT, {
    header: header,
    message: message,
    type: 'error'
  });
}

SocketHelper.prototype.findSocket = function(io, id) {
  for (var index in io.sockets.connected) {
    console.log(io.sockets.connected[index]);
  }
}

module.exports = function(io) {
  var helper = new SocketHelper();

  io.on('connection', function(socket) {

    /* Chat Handler */
    require('./chat_socket')(socket, io, helper);

    /* Ban/Mute/Unban/Unmute handler */
    require('./punishment_socket')(socket, io, helper);

  });
}
