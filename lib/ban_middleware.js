var Ban = require('./../models/ban').Ban;

module.exports = function(req, res, next) {
  if (req.user) {
    if (Ban.isBanned(req.user._id)) {
      Ban.findUserBan(req.user._id, function(ban) {
        var expire = 'Never';
        if (ban.expire) {
          expire = ban.expire;
        }
        var error = encodeURIComponent('You have been banned. Your ban expires: ' + expire);
        res.send(error);
      });
    }
  }
  next();
};
