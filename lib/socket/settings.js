var request = require('request');

var User = require('./../../models/user').User;

var socket_incoming = {
  UPDATE_STEAM_SETTINGS: 'SETTINGS_OUT_UPDATE_STEAM',
  UPDATE_TRADE_URL: 'SETTINGS_OUT_UPDATE_TRADE_URL'
};

var socket_outgoing = {
  UPDATE_STEAM_SETTINGS: 'SETTINGS_IN_UPDATE_STEAM'
};

function isValidURL(s) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
}

module.exports = function(socket, io, _) {

  socket.on(socket_incoming.UPDATE_TRADE_URL, (data, callback) => {
    if (!_.ensureAuthenticated(true)) {
      return callback('You are not logged in.');
    }

    _.getUser((user) => {
      if (!user) {
        return callback('Unable to find user profile. Try relogging.');
      }

      if (!data.url || !isValidURL(data.url)) {
        return callback('Invalid URL entered.');
      }

      user.trade_url = data.url;
      user.save((err) => {
        if (err) {
          return callback('Error while saving to the database.');
        }
        return callback();
      });
    });
  });

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
