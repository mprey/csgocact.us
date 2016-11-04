module.exports = function(io) {
  io.on('connection', function(socket) {

    console.log('connected: ' + socket.request);

    /* Chat Handler */
    require('./chat_socket')(socket);

  })
}
