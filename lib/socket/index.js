var socket_outgoing = {
  ALERT: 'ALERT'
}

function SocketHelper(io, socket) {
  this.io = io;
  this.socket = socket;
}

SocketHelper.prototype.ensureAuthenticated = function() {
  if (this.socket.request.session.passport.user) {
    return true;
  } else {
    this.socket.emit(socket_outgoing.ALERT, {
      header: 'User Error',
      message: 'You are not logged in. Please sign in before continuing.',
      type: 'error'
    });
    return false;
  }
}

SocketHelper.prototype.sendError = function(header, message) {
  this.socket.emit(socket_outgoing.ALERT, {
    header: header,
    message: message,
    type: 'error'
  });
}

SocketHelper.prototype.findSocket = function(id) {
  for (var index in this.io.sockets.connected) {
    console.log(this.io.sockets.connected[index]);
  }
}

module.exports = function(io) {
  io.on('connection', function(socket) {

    var helper = new SocketHelper(io, socket);

    /* Chat Handler */
    require('./chat-socket')(socket, io, helper);

    /* Ban/Mute/Unban/Unmute handler */
    require('./punishment-socket')(socket, io, helper);

  });
}
