var request = require('request');

var User = require('./../../models/user').User;

var socket_incoming = {
  UPDATE_STEAM_SETTINGS: 'SETTINGS_OUT_UPDATE_STEAM'
};

var socket_outgoing = {
  UPDATE_STEAM_SETTINGS: 'SETTINGS_IN_UPDATE_STEAM'
};

module.exports = function(socket, io, _) {

  socket.on(socket_incoming.UPDATE_STEAM_SETTINGS, function() {
    if (_.ensureAuthenticated(true)) {
      _.getUser(function(user) {
        if (user) {
          var url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + process.env.AUTH_API_KEY + "&steamids=" + socket.request.session.passport.user;
          request(url, function(error, response, body) {
            if (!error && response.statusCode === 200) {
              var json = JSON.parse(body);
              user.updateProfile({
                name: json.response.players[0].personaname,
                photo: json.response.players[0].avatarfull
              }, function(error) {
                if (error) {
                  _.sendError('Steam Settings', 'Error while updating steam settings: ' + error.message);
                } else {
                  socket.emit(socket_outgoing.UPDATE_STEAM_SETTINGS, {
                    name: json.response.players[0].personaname,
                    photo: json.response.players[0].avatarfull
                  });
                }
              });
            } else {
              _.sendError('Steam Settings', 'Error while updating steam settings: ' + error.message);
              console.log("Error with steam_data API: ", error, ", status code: ", response.statusCode)
            }
          });
        }
      });
    }
  });

}
