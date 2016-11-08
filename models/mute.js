var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var muteSchema = {
  muted_id: {type: Number, required: true},
  muter_id: {type: Number, required: true},
  reason: {type: String, required: true, default:'None'},
  expire: {type: Date}
}

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

muteSchema.statics.isMuted = function(userId) {
  this.findOne({
    muted_id: userId
  }, function(err, mute) {
    if (!err && mute) {
      return !mute.isExpired();
    }
    return false;
  });
};

muteSchema.statics.findUserMute = function(userId, callback) {
  this.findOne({
    muted_id: userId
  }, function(err, mute) {
    if (!err && mute) {
      callback(mute);
    }
    callback();
  });
}

muteSchema.statics.unmuteUser = function(userId, callback) {
  this.remove({
    muted_id: userId
  }, callback);
};

var Mute = mongoose.model(muteSchema, 'mute');

module.exports = {
  Mute: Mute
}
