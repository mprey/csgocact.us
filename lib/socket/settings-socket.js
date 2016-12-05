var request = require('request');

var socket_incoming = {
  UPDATE_STEAM_SETTINGS: 'SETTINGS_OUT_UPDATE_STEAM'
};

var socket_outgoing = {
  UPDATE_STEAM_SETTINGS: 'SETTINGS_IN_UPDATE_STEAM'
};

module.exports = function(io, socket, _) {

  socket.on('SETTINGS_OUT_UPDATE_STEAM', function() {
    console.log('derp');
  });

  socket.on(socket_incoming.UPDATE_STEAM_SETTINGS, function() {
    console.log('UPDATINGGGG');
    if (_.ensureAuthenticated(true)) {
      console.log('requesting');
      var url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + process.env.AUTH_API_KEY + "&steamids=" + socket.request.session.passport.user;
      request('http://google.com', function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var json = JSON.parse(body);
          console.log(json);
        } else {
          console.log("Error with steam_data API: ", error, ", status code: ", response.statusCode)
        }
      });
    }
  });

}
