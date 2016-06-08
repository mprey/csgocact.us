var Coinflip = require('./../../models/coin-flip').Coinflip;
var User = require('./../../models/user').User;
var async = require('async');

module.exports.loadAvailableGames = function(callback) {
  Coinflip.find({ completed: false }, function(err, obj) {
    var games = [];
    var index = 0;
    async.series([
      //Load in each game into the array
      function(callback) {
        async.each(obj, function(val, callback) {
          games.push(val.toObject());
          return callback();
        }, callback);
      },
      //Update each game in the array
      function(callback) {
        async.each(games, function(val, callback) {
          async.series([
            function (callback) {
              User.findOne({ _id: val.id_creator }, function(err, user) {
                if (user) {
                  games[index].creator_name = user.name;
                  games[index].creator_photo = JSON.parse(user.photos)[0].value;
                }
                index++;
                return callback();
              });
            }
          ], callback);
        }, callback);
      }
    ], function(err) {
      return callback(err, games);
    });
  });
}
