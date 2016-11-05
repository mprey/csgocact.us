$(function() {

  var socket_outgoing = {

  };

  var socket_incoming = {
    ALERT: 'ALERT'
  };

  var socket = io.connect();

  socket.on(socket_incoming.ALERT, function(data) {
    swal(data.header, data.message, data.type);
  });

  window.socket = socket;

});
