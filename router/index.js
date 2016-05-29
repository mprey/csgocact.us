var games = require('./routes/games');
var logout = require('./routes/logout');
var auth = require('./routes/auth');
var index = require('./routes/index');
var profile = require('./routes/profile');

module.exports = function(app) {
  //app.use('/games', games);
  app.use('/logout', logout);
  app.use('/auth', auth);
  app.use('/', index);
  app.use('/profile', profile);
}
