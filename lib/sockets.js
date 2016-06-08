var Coinflip = require('./../models/coin-flip').Coinflip;
var User = require('./../models/user').User;

module.exports = function(io) {
  io.on('connection', function(socket) {
    //console.log('user connected');
    //console.log(socket.request.session.passport);

    socket.on('request coin-flips', function() {

    });

    socket.on('join coin-flip', function(id) {
      Coinflip.findOne({ _id: id }, function(err, game) {
        if (err || !game) {
          return socket.emit('alert', 'Unable to find specificed game ID.');
        }
        var gameEntry = game.amount;
        game.hasCompleted(function(result) {
          if (!result) {
            game.isAvailable(function(result) {
              if (result) {
                User.findOne({ _id: socket.request.session.passport._id }, function(err, user) {
                  if (err || !user) {
                    return socket.emit('alert', 'Unable to find user profile. Try logging out and back in.');
                  }
                  user.hasEnough(gameEntry, function(result) {
                    if (result) {
                      user.removeCoins(gameEntry, function(err) {
                        if (err) {
                          return socket.emit('alert', 'Unknown error occured. Please contact admins.');
                        }
                        socket.emit('remove coins', gameEntry);
                        socket.emit('join coin-flip success', id);
                      })
                    } else {
                      return socket.emit('alert', 'You do not have the required balance to play.');
                    }
                  });
                });
              } else {
                socket.emit('alert', 'Unable to join game.');
              }
            });
          } else {
            socket.emit('alert', 'Game already completed');
          }
        });
      });
    });

    socket.on('disconnect', function() {
      console.log('user idsconnected');
    });
  })
}
