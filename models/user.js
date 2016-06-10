var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id: {type: Number, required: true},
  name: {type: String, required: true},
  photos: {type: String, required: true},
  trade_url: {type: String, required: false},
  role: {type: Number, required: true, default: 0},
  balance: {type: Number, required: true, default: 0},
  date_joined: {type: Date, default: Date.now, required: true}
});

userSchema.methods.updateTradeURL = function(tradeURL, callback) {
  this.tade_url = tradeURL;
  return this.save(callback);
};

userSchema.methods.updateCoins = function(amount, callback) {
  this.balance += amount;
  return this.save(callback);
};

userSchema.methods.removeCoins = function(amount, callback) {
  callback(this.updateCoins(-amount));
};

userSchema.methods.addCoins = function(amount, callback) {
  callback(this.updateCoins(+amount));
};

userSchema.methods.hasEnough = function(amount, callback) {
  return callback(this.balance > amount);
};

userSchema.methods.updateProfile = function(data, callback) {
  this.name = data.name;
  this.photos = JSON.stringify(data.photos);
  return this.save(callback);
};

var User = mongoose.model('User', userSchema);

module.exports = {
  User: User
};
