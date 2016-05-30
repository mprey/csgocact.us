var socket = io();

$(document).ready(function() {
  queryGames();
});

function queryGames() {
  socket.emit('request coin-flips', {});
}

function addGame(game) {
  var face = game.starting_face;
  var amount = game.amount;
  $("ul.games").append("<li><a href='/games/coin-flip/join" + game._id + "'<span class='join-game'>Join</span></a></li>");
}

function createElement(profile,in_progress,amount,face) {
  var append = '<li>';
}

socket.on('send profile', function (data) {

});

socket.on('send coin-flips', function (data) {
  data.games.forEach(function(game) {
    addGame(game);
  });
});
