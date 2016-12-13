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
  _id: {type: Number, required: true},
  name: {type: String, required: true},
  photo: {type: String, required: true},
  trade_url: {type: String, required: false},
  rank: {type: Number, required: true, default: 0},
  credits: {type: Number, required: true, default: 0.00},
  date_joined: {type: Date, default: Date.now, required: true},
  promo_code: {type:Boolean, default: false, required: true}
});

userSchema.methods.setRank = function(rank, callback) {
  this.rank = rank;
  this.save(callback);
};

userSchema.methods.updateTradeURL = function(tradeURL, callback) {
  this.tade_url = tradeURL;
  return this.save(callback);
};

userSchema.methods.updateCredits = function(amount, callback) {
  this.credits += amount;
  return this.save(callback);
};

userSchema.methods.removeCredits = function(amount, callback) {
  return this.updateCredits(-amount, callback);
};

userSchema.methods.addCredits = function(amount, callback) {
  return this.updateCredits(+amount, callback);
};

userSchema.methods.hasEnough = function(amount) {
  return (this.credits >= amount);
};

userSchema.methods.hasEnteredPromoCode = function() {
  return this.promo_code == true;
};

userSchema.methods.enterPromoCode = function(callback) {
  this.promo_code = true;
  return this.save(callback);
};

userSchema.methods.updateProfile = function(data, callback) {
  this.name = data.name;
  this.photo = data.photo;
  return this.save(callback);
};

var User = mongoose.model('User', userSchema);

module.exports = {
  User: User
};
