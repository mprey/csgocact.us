$(function() {

  var socket_outgoing = {

  };

  var socket_incoming = {
    ALERT: 'ALERT',
    FORCE_RELOAD: 'FORCE_RELOAD'
  };

  var socket = io.connect();

  socket.on(socket_incoming.ALERT, function(data) {
    swal(data.header, data.message, data.type);
  });

  socket.on(socket_incoming.FORCE_RELOAD, function() {
    location.reload();
  });

  window.socket = socket;

});
