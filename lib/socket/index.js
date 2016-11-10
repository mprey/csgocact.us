var User = require('./../../models/user').User;

var socket_outgoing = {
  ALERT: 'ALERT'
}

function SocketHelper(io, socket) {
  this.io = io;
  this.socket = socket;
  this.instance = this;
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

SocketHelper.prototype.getUser = function(callback) {
  User.findById(this.socket.request.session.passport.user, function(err, user) {
    if (!err && user) {
      return callback(user);
    } else {
      this.instance.sendError('User Error', 'Unable to find profile data. Please logout and login.');
      return callback();
    }
  });
}

SocketHelper.prototype.hasPermission = function(user, required, send_message) {
  var message = send_message || true;
  if (user.rank >= required) {
    return true;
  } else {
    if (message) {this.instance.sendError('Permissions Error', 'You do not have permission to perform this action.');}
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
