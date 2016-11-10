var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var muteSchema = new Schema({
  muted_id: {type: Number, required: true},
  muter_id: {type: Number, required: true},
  reason: {type: String, required: true, default:'None'},
  expire: {type: Date}
});

muteSchema.methods.isExpired = function() {
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

muteSchema.statics.isMuted = function(userId, callback) {
  this.findOne({
    muted_id: userId
  }, function(err, mute) {
    if (!err && mute) {
      return callback(!mute.isExpired());
    }
    return callback();
  });
};

muteSchema.statics.findUserMute = function(userId, callback) {
  this.findOne({
    muted_id: userId
  }, function(err, mute) {
    if (!err && mute) {
      return callback(mute);
    }
    return callback();
  });
}

muteSchema.statics.unmuteUser = function(userId, callback) {
  this.remove({
    muted_id: userId
  }, callback);
};

var Mute = mongoose.model('mute', muteSchema);

module.exports = {
  Mute: Mute
}
