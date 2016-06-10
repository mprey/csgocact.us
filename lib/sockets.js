var Coinflip = require('./../models/coin-flip').Coinflip;
var User = require('./../models/user').User;

module.exports = function(io) {
  io.on('connection', function(socket) {
    //console.log('user connected');
    //console.log(socket.request.session.passport);

    socket.on('request coin-flips', function() {

    });

    socket.on('change coins', function(data) {
      var amount = data.amount;
      console.log(amount);
      User.findById(socket.request.session.passport.user._id, function(err, user) {
        if (!err && user) {
          user.updateCoins(amount, function(err) {
            if (!err) {
              socket.emit('update coins', {amount: amount});
            } else {
              socket.emit('alert', 'unale to update');
            }
          });
        } else {
          socket.emit('alert', 'unable to find stuff');
        }
      });
    });

    socket.on('join coin-flip', function(id) {
      Coinflip.findOne({ _id: id }, function(err, game) {
        if (err || !game) {
          return socket.emit('alert', {message: 'Unable to find specificed game ID.'});
        }
        var gameEntry = game.amount;
        game.hasCompleted(function(result) {
          if (!result) {
            game.isAvailable(function(result) {
              if (result) {
                User.findById(socket.request.session.passport.user._id, function(err, user) {
                  if (err || !user) {
                    return socket.emit('alert', {message: 'Unable to find user profile. Try logging out and back in.'});
                  }
                  user.hasEnough(gameEntry, function(result) {
                    if (result) {
                      user.removeCoins(gameEntry, function(err) {
                        if (err) {
                          console.log(err);
                          return socket.emit('alert', {message: 'Unknown error occured. Please contact admins.'});
                        }
                        socket.emit('remove coins', {amount: gameEntry});
                        socket.emit('join coin-flip success', {_id: id});
                      })
                    } else {
                      return socket.emit('alert', {message: 'You do not have the required balance to play.'});
                    }
                  });
                });
              } else {
                socket.emit('alert', {message: 'Unable to join game.'});
              }
            });
          } else {
            socket.emit('alert', {message: 'Game already completed'});
          }
        });
      });
    });

    socket.on('disconnect', function() {

    });
  })
}
