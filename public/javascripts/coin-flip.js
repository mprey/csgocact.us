var socket = io();

var games = [];

$(document).ready(function() {

  local_games.forEach(function(obj) {
    addGame(obj);
  });

  $('.games > tbody > tr').on('click', 'a.join-game', function(event) {
    var id = $(this).parent().parent().attr('class');
    joinGame(id);
  });

  $('#create').click(function(event) {

  });

  $('#refresh').click(function(event) {

  });

  $('#add-coins').click(function(event) {
    socket.emit('change coins', {amount: 100});
  });
});

function getGame(id, cb) {
  games.forEach(function(obj) {
    if (obj._id == id) {
      cb(obj);
    };
  })
}

function addGame(game) {
  games.push(game);

  var face = game.starting_face;
  var amount = game.amount;
  var in_progress = game.id_joiner != null;
  var id = game._id;
  var photo = game.creator_photo;
  var name = game.creator_name;
  $("table.games").append(createElement(id,name,photo,in_progress,amount,face));
}

function joinGame(id) {
  socket.emit('join coin-flip', id);
}

function createElement(id,name,photo,in_progress,amount,face) {
  var append = '<tr class="' + id + '">';

  //user
  append += "<td class='user'>";
  append += "<img class='profile' src='" + photo + "'> <span class='name'>" + name + "</span>";
  append += "</td>";

  //status
  append += "<td class='status'>";
  if (in_progress) {
    append += "<span class='in_progress>In Progress</span>'"
  } else {
    append += "<a class='join-game' href='javascript:void(0)';'>Join</a>"
  }
  append += "</td>";

  //face
  append += "<td class='amount'>";
  append += "<span class='amount'>" + amount + " C</span> "

  append += "<img class='face' src='";
  if (face == 1) {
    append += "../images/t-coin.png";
  } else {
    append += "../images/ct-coin.png";
  }
  append += "'>"
  append += "</td>";

  append += '</tr>';
  return append;
}

function updateCoins(amount) {
  var newBalance = parseInt($('#balance').text(), 10) + amount;
  $('#balance').text(newBalance);
}

socket.on('alert', function(data) {
  alert(data.message);
});

socket.on('join coin-flip success', function(data) {

});

socket.on('remove coin-flip', function(id) {

});

socket.on('update coin-flip', function(data) {

});

socket.on('add coin-flip', function(data) {
  addGame(data);
});

socket.on('remove coins', function(data) {
  updateCoins(-data.amount);
});

socket.on('add coins', function(data) {
  updateCoins(data.amount);
});

socket.on('update coins', function(data) {
  updateCoins(data.amount);
});
