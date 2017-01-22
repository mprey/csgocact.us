var User = require('./../../models/user').User;
var Ban = require('./../../models/ban').Ban;
var Mute = require('./../../models/mute').Mute;

var socket_outgoing = {
  MUTE_USER: 'CHAT_IN_MUTE_USER',
  UNMUTE_USER: 'CHAT_IN_UNMUTE_USER',
  BAN_USER: 'CHAT_IN_BAN_USER',
  UNBAN_USER: 'CHAT_IN_UNBAN_USER',
  BOT_MESSAGE: 'CHAT_IN_BOT_MESSAGE',
  ALERT: 'ALERT',
  FORCE_RELOAD: 'CHAT_IN_RELOAD_AGE'
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

  socket.on(socket_incoming.MUTE_USER, function(data) { //data.muted_id, data.expire, data.reason
    if (_.ensureAuthenticated()) {
      _.getUser(function(muter) {
        if (muter && _.hasPermission(muter, ranks.MOD)) {
          User.findById(data.muted_id, function(err, muted) {
            if (!err && muted) {
              var mute = new Mute({
                muted_id: muted._id,
                muter_id: muter._id,
                reason: data.reason,
                expire: data.expire
              });
              mute.save(function(err) {
                if (!err) {
                  io.emit(socket_outgoing.MUTE_USER, {
                    profile_name: muted.name,
                    reason: data.reason,
                    expire: data.expire
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Unable to mute user "' + muted.name + '". Please contact a developer. Error message: ' + err.message
                  });
                }
              });
            } else {
              _.sendError('User Error', 'Unable to find user with ID: ' + data.banned_id);
            }
          });
        }
      });
    }
  });

  socket.on(socket_incoming.UNMUTE_USER, function(data) { //data.unmuted_id
    if (_.ensureAuthenticated()) {
      _.getUser(function(unmuter) {
        if (unmuter && _.hasPermission(unmuter, ranks.MOD)) {
          User.findById(data.unmuted_id, function(err, unmuted) {
            if (!err && unmuted) {
              Mute.unmuteUser(data.unmuted_id, function(err) {
                if (!err) {
                  io.emit(socket_outgoing.UNMUTE_USER, {
                    profile_name: unmuted.name
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Unable to unmute user "' + unmuted.name + '". Please contact a developer. Error message: ' + err.message
                  });
                }
              });
            } else {
              _.sendError('User Error', 'Unable to find user with ID: ' + data.unmuted_id);
            }
          });
        } //omg the waterfall
      });
    }
  });

  socket.on(socket_incoming.BAN_USER, function(data) { //data.banned_id, data.expire, data.reason
    if (_.ensureAuthenticated()) {
      _.getUser(function(banner) {
        if (banner && _.hasPermission(banner, ranks.ADMIN)) {
          User.findById(data.banned_id, function(err, banned) {
            if (!err && banned) {
              var ban = new Ban({
                banned_id: banned._id,
                banner_id: banner._id,
                reason: data.reason,
                expire: data.expire
              });
              ban.save(function(err) {
                if (!err) {
                  io.emit(socket_outgoing.BAN_USER, {
                    profile_name: banned.name,
                    reason: data.reason,
                    expire: data.expire
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Unable to ban user "' + banned.name + '". Please contact a developer. Error message: ' + err.message
                  });
                }
              });
              var bannedSocket = _.findSocket(data.banned_id);
              if (bannedSocket) {
                bannedSocket.emit(socket_outgoing.FORCE_RELOAD);
              }
            } else {
              _.sendError('User Error', 'Unable to find user with ID: ' + data.banned_id);
            }
          });
        }
      });
    }
  });

  socket.on(socket_incoming.UNBAN_USER, function(data) { //data.unbanned_id
    if (_.ensureAuthenticated()) {
      _.getUser(function(unbanner) {
        if (unbanner && _.hasPermission(unbanner, ranks.ADMIN)) {
          User.findById(data.unbanned_id, function(err, unbanned) {
            if (!err && unbanned) {
              Ban.unbanUser(data.unbanned_id, function(err) {
                if (!err) {
                  io.emit(socket_outgoing.UNBAN_USER, {
                    profile_name: unbanned.name
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Unable to unban user "' + unbanned.name + '". Please contact a developer. Error message: ' + err.message
                  });
                }
              });
            } else {
              _.sendError('User Error', 'Unable to find user with ID: ' + data.unbanned_id);
            }
          });
        } //omg the waterfall i should really learn Promises
      });
    }
  });

}
