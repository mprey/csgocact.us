var botManager = require('./../../../manager/bot');

var socket_outgoing = {

};

var socket_incoming = {

};

module.exports = (io) => {

  botManager.setIo(io);

  io.on('connection', (socket) => {
    console.log('A bot connected with id: ', socket.id);

    botManager.addBot(socket.id);

    socket.on('disconnect', () => {
      botManager.removeBot(socket.id);
    });

    require('./deposit')(socket, io, botManager);

    require('./withdraw')(socket, io, botManager);

  });

}
