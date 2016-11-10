var User = require('./../../models/user').User;
var Chat = require('./../../models/chat').Chat;
var Mute = require('./../../models/mute').Mute;
var async = require('async');

var socket_outgoing = {
  UPDATE_ONLINE: 'CHAT_IN_UPDATE_ONLINE',
  INCREMENT_ONLINE: 'CHAT_IN_INCREMENET_ONLINE',
  DECREMENT_ONLINE: 'CHAT_IN_DECREMENT_ONLINE',
  MUTE_USER: 'CHAT_IN_MUTE_USER',
  UNMUTE_USER: 'CHAT_IN_UNMUTE_USER',
  BAN_USER: 'CHAT_IN_BAN_USER',
  UNBAN_USER: 'CHAT_IN_UNBAN_USER',
  RECEIVE_MESSAGE: 'CHAT_IN_RECEIVE_MESSAGE',
  RELOAD_PAGE: 'CHAT_IN_RELOAD_PAGE',
  CLEAR_CHAT: 'CHAT_IN_CLEAR_CHAT',
  BOT_MESSAGE: 'CHAT_IN_BOT_MESSAGE',
  CHAT_MODE: 'CHAT_IN_CHAT_MODE',
  INIT_CHAT: 'CHAT_IN_INIT_CHAT',
  ALERT: 'ALERT'
};

var socket_incoming = {
  SEND_CHAT: 'CHAT_OUT_SEND_MESSAGE',
  MUTE_USER: 'CHAT_OUT_MUTE_USER',
  UNMUTE_USER: 'CHAT_OUT_UNMUTE_USER',
  BAN_USER: 'CHAT_OUT_BAN_USER',
  UNBAN_USER: 'CHAT_OUT_UNBAN_USER',
  RELOAD_PAGE: 'CHAT_OUT_RELOAD_PAGE',
  CLEAR_CHAT: 'CHAT_OUT_CLEAR_CHAT',
  BOT_MESSAGE: 'CHAT_OUT_BOT_MESSAGE',
  CHAT_MODE: 'CHAT_OUT_CHAT_MODE',
  INIT_CHAT: 'CHAT_OUT_INIT_CHAT'
};

var ranks = {
  NORMAL: 0,
  MOD: 1,
  ADMIN: 2,
  DEVELOPER: 3,
  BOT: 4
};

var RECENT_MESSAGE_CAP =  50;

var recentMessages = []; //queue the 50 most recent messages for newcomers so we dont have to query the database

var chatModes = {
  NORMAL: 0,
  STAFF_ONLY: 1
}

var chatMode = chatModes.NORMAL;

function formatDate(input) {
  if (input) {
    var date_future = new Date(Date.parse(input));
    var date_now = new Date();
    // get total seconds between the times
    var delta = Math.abs(date_future - date_now) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = Math.floor(delta % 60);  // in theory the modulus is not required

    return formatTime(days, hours, minutes, seconds);
  } else {
    return 'Never';
  }
}

function formatTime(days, hours, minutes, seconds) {
  var array = [];
  if (days != 0) {array.push(days + ' day' + (days == 1 ? '' : 's'));}
  if (hours != 0) {array.push(hours + ' hour' + (hours == 1 ? '' : 's'));}
  if (minutes != 0) {array.push(minutes + ' minute' + (minutes == 1 ? '' : 's'));}
  if (seconds != 0) {array.push(seconds + ' second' + (seconds == 1 ? '' : 's'));}
  return array.join(', ');
}

function setChatMode(mode, callback) {
  if (mode == 'normal') {
    chatMode = chatModes.NORMAL;
  } else if (mode == 'staff') {
    chatMode = chatModes.STAFF_ONLY;
  } else {
    return callback(false);
  }
  return callback(true);
}

module.exports = function(socket, io, _) {

  socket.on(socket_incoming.INIT_CHAT, function() {
    var currentUsers = Object.keys(io.sockets.sockets).length;

    if (recentMessages.length < RECENT_MESSAGE_CAP) { //we need to query the database for messages if we dont have enough recent messages (very rarely)
      var previousMessages = [];

      var data = [];

      async.series([
        function(callback) {
          Chat.getRecentMessages(RECENT_MESSAGE_CAP, function(err, result) {
            if (!err && result) {
              data = result;
              callback();
            } else {
              callback(err);
            }
          });
        },
        function(callback) {
          var counter = 0;
          if (data.length > 0) {
            data.forEach(function(obj) {
              obj.formatChatMessage(function(err, msg) {
                if (!err && msg) {
                  previousMessages.push(msg);
                  counter++;
                  if (data.length == counter) {
                    callback();
                  }
                } else {
                  callback(err);
                }
              });
            });
          } else {
            callback(new Error('No local data available'));
          }
        }
      ], function(err, results) {
        if (!err) {
          socket.emit(socket_outgoing.INIT_CHAT, {
            previous_messages: previousMessages.reverse(),
            current_users: currentUsers
          });
          recentMessages = previousMessages.reverse();
        } else {
          socket.emit(socket_outgoing.INIT_CHAT, {
              previous_messages: [],
              current_users: currentUsers
          });
          _.sendError('Chat Error', 'Unable to load previous messages. Error: ' + err.message);
        }
      });
    } else {
      var reversedMessages = [].concat(recentMessages).reverse();
      socket.emit(socket_outgoing.INIT_CHAT, {
        current_users: currentUsers,
        previous_messages: reversedMessages
      });
    }

    socket.broadcast.emit(socket_outgoing.INCREMENT_ONLINE);
  });

  socket.on(socket_incoming.SEND_CHAT, function(data) {
    if (_.ensureAuthenticated()) {
      User.findById(socket.request.session.passport.user, function(err, user) {
        if (!err && user) {
          Mute.isMuted(user._id, function(result) {
            if (!result) {
              if (chatMode == chatModes.NORMAL || (chatMode == chatModes.STAFF_ONLY && _.hasPermission(user, ranks.MOD, false))) {
                var chatData = {
                  id: user._id,
                  profile_name: user.name,
                  profile_img: user.photo,
                  rank: user.rank,
                  text: data.text
                }
                io.emit(socket_outgoing.RECEIVE_MESSAGE, chatData);
                recentMessages.unshift(chatData);
                recentMessages.length = RECENT_MESSAGE_CAP;

                var chatModel = new Chat({
                  sender_id: user._id,
                  content: data.text
                });
                chatModel.save(function(err) {
                  if (err) {
                    _.sendError('Chat Error', 'Error while saving your chat to the database. Please contact the developers.');
                  }
                });
              } else {
                socket.emit(socket_outgoing.BOT_MESSAGE, {
                  text: 'You cannot send messages in the current chat mode.'
                });
              }
            } else {
              Mute.findUserMute(user._id, function(mute) {
                _.sendError('Chat Error', 'You are muted. Your mute expires: ' + formatDate(mute.expire));
              });
            }
          });
        } else {
          _.sendError('Chat Error', 'Error while processing. Please contact developers with this message: ' + err.message);
        }
      });
    }
  });

  socket.on(socket_incoming.CLEAR_CHAT, function(data) {

  });

  socket.on(socket_incoming.BOT_MESSAGE, function(data) { //data.text
    if (_.ensureAuthenticated()) {
      _.getUser(function(user){
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          io.emit(socket_outgoing.BOT_MESSAGE, {
            text: data.text
          });
        }
      });
    }
  });

  socket.on(socket_incoming.CHAT_MODE, function(data) {
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          setChatMode(data.mode, function(result) {
            if (result) {
              io.emit(socket_outgoing.CHAT_MODE, {
                mode: data.mode
              });
            } else {
              socket.emit(socket_outgoing.BOT_MESSAGE, {
                text: 'Unable to set chat mode to mode: ' + data.mode
              });
            }
          });
        }
      });
    }
  });

  socket.on('disconnect', function() {
    io.emit(socket_outgoing.DECREMENT_ONLINE);
  });
}
