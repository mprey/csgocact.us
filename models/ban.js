var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var banSchema = new Schema({
  banned_id: {type: Number, required: true},
  banner_id: {type: Number, required: true},
  reason: {type: String, required: true, default:'None'},
  expire: {type: Date}
});

banSchema.methods.isExpired = function() {
  if (this.expire) {
    var expireDate = Date.parse(this.expire);
    if (expireDate < new Date()) {
      this.remove();
      return true;
    } else {
      return false;
    }
  }
  return false;
};

banSchema.statics.findUserBan = function(userId, callback) {
  this.findOne({
    banned_id: userId
  }, function(err, ban) {
    if (!err && ban) {
      return callback(ban);
    }
    return callback();
  })
};

banSchema.statics.isBanned = function(userId, callback) {
  this.findOne({
    banned_id: userId
  }, function(err, ban) {
    if (!err && ban) {
      return callback(!ban.isExpired());
    }
    return callback();
  });
};

banSchema.statics.unbanUser = function(userId, callback) {
  this.remove({
    banned_id: userId
  }, callback);
};

var Ban = mongoose.model('ban', banSchema);

module.exports = {
  Ban: Ban
}
