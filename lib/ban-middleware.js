var Ban = require('./../models/ban').Ban;
var dateFormatter = require('./../manager/date-formatter');

module.exports = function(req, res, next) {
  if (req.user) {
    Ban.isBanned(req.user._id, function(result) {
      if (result) {
        Ban.findUserBan(req.user._id, function(ban) {
          res.end('You have been banned. Your ban expires: ' + dateFormatter.formatDate(ban.expire));
        });
      } else {
        next();
      }
    });
  } else {
    next();
  }
};
