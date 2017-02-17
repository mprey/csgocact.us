var botManager = require('../../../manager/bot');

var socket_outgoing = {

};

var socket_incoming = {

};

module.exports = (io, appIo) => {

  botManager.setIo(io);

  io.on('connection', (socket) => {
    console.log('A bot connected with id: ', socket.id);

    botManager.addBot(socket);

    socket.on('disconnect', () => {
      botManager.removeBot(socket);
    });

    require('./deposit')(socket, io, appIo, botManager);

    require('./withdraw')(socket, io, appIo, botManager);

  });

}
