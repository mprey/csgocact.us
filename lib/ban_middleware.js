var Ban = require('./../models/ban').Ban;

module.exports = function(req, res, next) {
  if (req.user) {
    Ban.isBanned(req.user._id, function(result) {
      if (result) {
        Ban.findUserBan(req.user._id, function(ban) {
          var expire = 'Never';
          if (ban.expire) {
            expire = ban.expire;
          }
          res.end('You have been banned. Your ban expires: ' + expire);
        });
      } else {
        next();
      }
    });
  } else {
    next();
  }
};
