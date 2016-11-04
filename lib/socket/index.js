var usercount = require('./../user_count');

module.exports = function(io) {
  io.on('connection', function(socket) {

    /* Chat Handler */
    require('./chat_socket')(socket, io);

    /* update online count */
    usercount.incrementCount();

    socket.on('disconnect', function() {
      /* update online count */
      usercount.decrementCount();
    });

  })
}
