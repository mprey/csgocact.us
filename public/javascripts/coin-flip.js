var socket = io();

$(document).ready(function() {
  queryGames();

  $('.games').on('click', 'a.join-game', function(event) {
    console.log($(this).text());
  });
});


function queryGames() {
  socket.emit('request coin-flips', {});
}

function addGame(game) {
  getProfile(game.id_creator, function(profile) {
    if (!profile) {
      return;
    }
    var face = game.starting_face;
    var amount = game.amount;
    var in_progress = game.id_joiner != null;
    var id = game._id;
    $("table.games").append(createElement(id,profile,in_progress,amount,face));
  });
}

function joinGame(id) {
  console.log("joining game with id: " + id);
}

function createElement(id,profile,in_progress,amount,face) {
  var append = '<tr class="' + id + '">';

  //user
  append += "<td class='user'>";
  append += "<img class='profile' src='" + profile.images[0] + "'> <span class='name'>" + profile.name + "</span>";
  append += "</td>";

  //status
  append += "<td class='status'>";
  if (in_progress) {
    append += "<span class='in_progress>In Progress</span>'"
  } else {
    append += "<a class='join-game' href='javascript:void(0)';'>Join</a>"
  }
  append += "</td>";

  //amount
  append += "<td class='amount'>";
  append += amount + " D";
  append += "</td>";

  //face
  append += "<td class='face'>";
  if (face == 1) {
    append += "heads";
  } else {
    append += "tails";
  }
  append += "</td>";

  append += '</tr>';
  return append;
}

socket.on('send profile', function(data) {

});

socket.on('error', function(msg) {
  alert(msg);
});

socket.on('send coin-flips', function(data) {
  data.games.forEach(function(game) {
    addGame(game);
  });
});
