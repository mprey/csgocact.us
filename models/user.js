var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ranks = {
  NORMAL: 0,
  MOD: 1,
  ADMIN: 2,
  DEVELOPER: 3,
  BOT: 4
};

var userSchema = new Schema({
  _id: {type: String, required: true},
  name: {type: String, required: true},
  photo: {type: String, required: true},
  trade_url: {type: String, required: false},
  rank: {type: Number, required: true, default: 0},
  credits: {type: Number, required: true, default: 0.00},
  date_joined: {type: Date, default: Date.now, required: true},
  promo_code: {type: Boolean, default: false, required: true}
});

userSchema.methods.setRank = function(rank, callback) {
  this.rank = rank;
  this.save(callback);
}

userSchema.methods.updateCredits = function(amount, callback) {
  var self = this;
  User.findByIdAndUpdate(this._id, { $inc: {credits: amount} }, { new: true }, function(err,  doc) {
    self.credits = doc ? doc.credits : self.credits;
    return callback(err, doc);
  });
}

userSchema.methods.removeCredits = function(amount, callback) {
  return this.updateCredits(-amount, callback);
}

userSchema.methods.addCredits = function(amount, callback) {
  return this.updateCredits(+amount, callback);
}

userSchema.methods.hasEnough = function(amount) {
  return (this.credits >= amount);
}

userSchema.methods.hasEnteredPromoCode = function() {
  return this.promo_code == true;
}

userSchema.methods.enterPromoCode = function(callback) {
  this.promo_code = true;
  return this.save(callback);
}

userSchema.methods.updateProfile = function(data, callback) {
  this.name = data.name;
  this.photo = data.photo;
  return this.save(callback);
}

userSchema.statics.updateUserBalance = function(userId, amount, callback) {
  return this.findOneAndUpdate({ _id: userId }, { $inc: { credits: amount } }, { new: true } ,callback);
}

var User = mongoose.model('User', userSchema);

module.exports = {
  User: User
};
