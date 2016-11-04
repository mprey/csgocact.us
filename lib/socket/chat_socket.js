var usercount = require('./../user_count');
var User = require('./../../models/user').User;

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
  ALERT: 'CHAT_IN_ALERT'
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
  REQUEST_ONLINE: 'CHAT_OUT_REQUEST_ONLINE'
};

module.exports = function(socket, io) {
  socket.on(socket_incoming.REQUEST_ONLINE, function() {
    socket.emit(socket_outgoing.UPDATE_ONLINE, {
      amount: usercount.getCount()
    });
  });

  socket.on(socket_incoming.SEND_CHAT, function(data) {
    if (socket.request.session.passport.user) {
      User.findById(socket.request.session.passport.user, function(err, user) {
        if (!err && user) {
          io.sockets.emit(socket_outgoing.RECEIVE_MESSAGE, {
            id: user._id,
            profile_name: user.name,
            profile_img: user.photo,
            rank: user.rank,
            text: data.text
          });
        } else {
          socket.emit(socket_outgoing.ALERT, {
            type: 'error',
            message: 'Error while processing. Please contact developers with this message: ' + err.message
          });
        }
      });
    } else {
      socket.emit(socket_outgoing.ALERT, {
        type: 'error',
        message: 'You are not logged in.'
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

  socket.on(socket_outgoing.BOT_MESSAGE, function(data) {

  });

  socket.on(socket_outgoing.CHAT_MODE, function(data) {

  });
}
