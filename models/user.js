var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id: {type: Number, required: true},
  name: {type: String, required: true},
  photo: {type: String, required: true},
  trade_url: {type: String, required: false},
  rank: {type: Number, required: true, default: 0},
  credits: {type: Number, required: true, default: 0.00},
  date_joined: {type: Date, default: Date.now, required: true}
});

userSchema.methods.updateTradeURL = function(tradeURL, callback) {
  this.tade_url = tradeURL;
  return this.save(callback);
};

userSchema.methods.updateCoins = function(amount, callback) {
  this.credits += amount;
  return this.save(callback);
};

userSchema.methods.removeCoins = function(amount, callback) {
  callback(this.updateCoins(-amount));
};

userSchema.methods.addCoins = function(amount, callback) {
  callback(this.updateCoins(+amount));
};

userSchema.methods.hasEnough = function(amount) {
  return (this.credits > amount);
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
