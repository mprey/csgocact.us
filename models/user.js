var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id: {type: Number, required: true},
  total_coin_flips: {type: Number, required: true, default: 0},
  total_coin_flips_wagered: {type: Number, required: true, default: 0},
  trade_url: {type: String, required: false},
  date_joined: {type: Date, default: Date.now, required: true}
});

var User = mongoose.model('User', userSchema);

module.exports = {
  User: User
};
