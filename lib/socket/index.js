module.exports = function(io) {
  io.on('connection', function(socket) {
    
    /* Chat Handler */
    require('./chat_socket')(socket);

  })
}
