var socket_incoming = {
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
  CHAT_MODE: 'CHAT_IN_CHAT_MODE'
};

var socket_outgoing = {
  SEND_CHAT: 'CHAT_OUT_SEND_MESSAGE',
  MUTE_USER: 'CHAT_OUT_MUTE_USER',
  UNMUTE_USER: 'CHAT_OUT_UNMUTE_USER',
  BAN_USER: 'CHAT_OUT_BAN_USER',
  UNBAN_USER: 'CHAT_OUT_UNBAN_USER',
  RELOAD_PAGE: 'CHAT_OUT_RELOAD_PAGE',
  CLEAR_CHAT: 'CHAT_OUT_CLEAR_CHAT',
  BOT_MESSAGE: 'CHAT_OUT_BOT_MESSAGE',
  CHAT_MODE: 'CHAT_OUT_CHAT_MODE'
};

module.exports = function(socket) {
  socket.on(socket_outgoing.SEND_CHAT, function(data) {
    console.log(data);
    console.log(socket);
  });

  socket.on(socket_outgoing.MUTE_USER, function(data) {

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
