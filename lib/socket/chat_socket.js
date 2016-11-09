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

var RECENT_MESSAGE_CAP =  50;

var recentMessages = []; //queue the 50 most recent messages for newcomers so we dont have to query the database

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
          if (!Mute.isMuted(user._id)) {
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
            Mute.findUserMute(user._id, function(mute) {
              _.sendError('Chat Error', 'You are muted. Your mute expires: ' + mute.expire);
            });
          }
        } else {
          _.sendError('Chat Error', 'Error while processing. Please contact developers with this message: ' + err.message);
        }
      });
    }
  });

  socket.on(socket_incoming.MUTE_USER, function(data) {

  });

  socket.on(socket_outgoing.UNMUTE_USER, function(data) {

  });

  socket.on(socket_outgoing.BAN_USER, function(data) {

  });

  socket.on(socket_outgoing.UNBAN_USER, function(data) {

  });

  socket.on(socket_outgoing.RELOAD_PAGE, function(data) {

  });

  socket.on(socket_outgoing.CLEAR_CHAT, function(data) {

  });

  socket.on(socket_outgoing.BOT_MESSAGE, function(data) { //data.message

  });

  socket.on(socket_outgoing.CHAT_MODE, function(data) {

  });

  socket.on('disconnect', function() {
    io.emit(socket_outgoing.DECREMENT_ONLINE);
  });
}
