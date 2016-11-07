var User = require('./../../models/user').User;

var socket_outgoing = {
  MUTE_USER: 'CHAT_IN_MUTE_USER',
  UNMUTE_USER: 'CHAT_IN_UNMUTE_USER',
  BAN_USER: 'CHAT_IN_BAN_USER',
  UNBAN_USER: 'CHAT_IN_UNBAN_USER',
  ALERT: 'ALERT',
  FORCE_RELOAD: 'FORCE_RELOAD'
}

var socket_incoming = {
  MUTE_USER: 'CHAT_OUT_MUTE_USER',
  UNMUTE_USER: 'CHAT_OUT_UNMUTE_USER',
  BAN_USER: 'CHAT_OUT_BAN_USER',
  UNBAN_USER: 'CHAT_OUT_UNBAN_USER',
}

var ranks = {
  NORMAL: 0,
  MOD: 1,
  ADMIN: 2,
  DEVELOPER: 3,
  BOT: 4
};

module.exports = function(socket, io, _) {
  socket.on(socket_incoming.MUTE_USER, function(data) {

  });

  socket.on(socket_incoming.UNMUTE_USER, function(data) {

  });

  socket.on(socket_incoming.BAN_USER, function(data) { //data.banned_id, data.expire, data.reason
    if (_.ensureAuthenticated(socket)) {
      User.findById(socket.request.session.passport.user, function(err, banner) {
        if (!err && banner) {
          User.findById(data.banned_id, function(err, banned) {
            if (!err && banned) {

            } else {
              _.sendError(socket, 'User Error', 'Unable to find user with ID: ' + data.banned_id);
            }
          });
          if (banner.rank == ranks.ADMIN || banner.rank == ranks.DEVELOPER) {
            var banned = _.findSocket(io, data.banned_id);
            if (banned) {
              banned.emit(socket_outgoing.FORCE_RELOAD);
            }
          } else {
            _.sendError(socket, 'Permissions Error', 'You do not have permission to ban users.');
          }
        } else {
          _.sendError(socket, 'User Error', 'You are not logged in.');
        }
      });
    }
  });

  socket.on(socket_incoming.UNBAN_USER, function(data) {

  });
}
