var User = require('./../../models/user').User;
var Chat = require('./../../models/chat').Chat;
var Mute = require('./../../models/mute').Mute;
var PromoCode = require('./../../models/promo-code').PromoCode;
var chatHistory = require('./../../manager/chat-history');
var dateFormatter = require('./../date-formatter');
var async = require('async');

var socket_outgoing = {
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
  INIT_CHAT: 'CHAT_OUT_INIT_CHAT',
  PROMOTE_USER: 'CHAT_OUT_PROMOTE_USER',
  DEMOTE_USER: 'CHAT_OUT_DEMOTE_USER',
  PROMO_CODE_CREATE: 'CHAT_OUT_PROMO_CREATE',
  PROMO_CODE_DELETE: 'CHAT_OUT_PROMO_DELETE'
};

var ranks = {
  NORMAL: 0,
  MOD: 1,
  ADMIN: 2,
  DEVELOPER: 3,
  BOT: 4
};

var chatModes = {
  NORMAL: 0,
  STAFF_ONLY: 1
}

var chatMode = chatModes.NORMAL;

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
    socket.emit(socket_outgoing.INIT_CHAT, {
      current_users: currentUsers,
      previous_messages: chatHistory.getHistory()
    });
  });

  socket.on(socket_incoming.PROMO_CODE_CREATE, function(data) {
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          PromoCode.getPromoCode(data.code, function(code) {
            if (!code) {
              var promoCode = new PromoCode({
                code: data.code,
                amount: data.amount,
                expire: data.expire
              });
              promoCode.save(function(err) {
                if (!err) {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Successfully created the promo code <strong>' + data.code + '</strong>.'
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Failed to create the promo code <strong>' + data.code + '<strong>.'
                  });
                }
              });
            } else {
              socket.emit(socket_outgoing.BOT_MESSAGE, {
                text: 'Promo code <strong>' + data.code + '</strong> already exists.'
              });
            }
          });
        }
      });
    }
  });

  socket.on(socket_incoming.PROMO_CODE_DELETE, function(data) { //data.code
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          PromoCode.getPromoCode(data.code, function(code) {
            if (code) {
              code.remove(function(err) {
                if (!err) {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Successfully removed the promo code <strong>' + data.code + '</strong>.'
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Unable to remove the promo code <strong>' + data.code + '</strong>.'
                  });
                }
              });
            } else {
              socket.emit(socket_outgoing.BOT_MESSAGE, {
                text: 'Unable to find promo code <strong>' + data.code + '</strong>.'
              });
            }
          });
        }
      });
    }
  });

  socket.on(socket_incoming.RELOAD_PAGE, function() {
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          io.emit(socket_outgoing.RELOAD_PAGE);
        }
      });
    }
  });

  socket.on(socket_incoming.DEMOTE_USER, function(data) {
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          User.findById(data.demote_id, function(err, demoted) {
            if (!err && demoted) {
              demoted.setRank(ranks.NORMAL, function(err) {
                if (!err) {
                  _.reloadSocket(data.demote_id);
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'User <strong>' + demoted.name + '</strong> has been demoted.'
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Unable to set the rank of user <strong>' + demoted.name + '</strong>. Error: ' + err.message
                  });
                }
              });
            } else {
              _.sendError('User Error', 'Unable to find user with ID: ' + data.demote_id);
            }
          });
        }
      });
    }
  });

  socket.on(socket_incoming.PROMOTE_USER, function(data) { //data.promote_id, data.rank
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          User.findById(data.promote_id, function(err, promoted) {
            if (!err && promoted) {
              var toRank = data.rank == 'admin' ? ranks.ADMIN : ranks.MOD;
              promoted.setRank(toRank, function(err) {
                if (!err) {
                  _.reloadSocket(data.promote_id);
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'User <strong>' + promoted.name + '</strong> has been promoted.'
                  });
                } else {
                  socket.emit(socket_outgoing.BOT_MESSAGE, {
                    text: 'Unable to set the rank of user <strong>' + promoted.name + '</strong>. Error: ' + err.message
                  });
                }
              });
            } else {
              _.sendError('User Error', 'Unable to find user with ID: ' + data.promote_id);
            }
          });
        }
      });
    }
  });

  socket.on(socket_incoming.DEMOTE_USER, function(data) {

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
                };
                io.emit(socket_outgoing.RECEIVE_MESSAGE, chatData);
                chatHistory.appendHistory(chatData);

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
                _.sendError('Chat Error', 'You are muted. Your mute expires: ' + dateFormatter.formatDate(mute.expire));
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
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          chatHistory.clearChat();
          io.emit(socket_outgoing.CLEAR_CHAT);
          _.sendGlobalBotMessage('The chat has been cleared.');
        }
      });
    }
  });

  socket.on(socket_incoming.BOT_MESSAGE, function(data) { //data.text
    if (_.ensureAuthenticated()) {
      _.getUser(function(user) {
        if (user && _.hasPermission(user, ranks.ADMIN)) {
          _.sendGlobalBotMessage(data.text);
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
}
