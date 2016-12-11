var coinflipManager = require('./../../../manager/games/coinflip-manager');

var socket_outgoing = {
  INIT_COINFLIP: 'COINFLIP_IN_INIT_COINFLIP',
  PROMO_CODE_END: 'PROMO_CODE_END',
  USER_HISTORY_DATA: 'COINFLIP_IN_USER_HISTORY_DATA',
  CURRENT_GAMES_DATA: 'COINFLIP_IN_CURRENT_GAMES_DATA'
};

var socket_incoming = {
  INIT_COINFLIP: 'COINFLIP_OUT_INIT_COINFLIP',
  REQUEST_PROMO_CODE: 'REQUEST_PROMO_CODE',
  REQUEST_CURRENT_GAMES: 'COINFLIP_OUT_REQUEST_CURRENT_GAMES'
};

module.exports = function(socket, io, _) {

  socket.on(socket_incoming.INIT_COINFLIP, function() { //data.online, data.total_wagered, data.games, data.history, data.leaderboards
    var data = {};
    
    data.online = Object.keys(io.sockets.sockets).length;
    data.total_wagered = coinflipManager.total_wagered;
    data.games = coinflipManager.currentGames;
    data.history = coinflipManager.historyGames;
    data.leaderboards = coinflipManager.leaderboards;

    socket.emit(socket_outgoing.INIT_COINFLIP, data);
  });

}
