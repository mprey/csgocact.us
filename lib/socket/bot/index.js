var BotManager = require('./../../../manager/bot');

var socket_outgoing = {

};

var socket_incoming = {

};

module.exports = (io) => {

  var botManager = new BotManager(io);

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
