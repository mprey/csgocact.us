var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userid: {type: String, required: true},
  total_bets: {type: Number, required: true, default: 0},
  total_wagered: {type: Number, required: true, default: 0},
  trade_url: {type: String, required: false},
  date_joined: {type: Date, default: Date.now, required: true}
});

var User = mongoose.model('User', userSchema);

module.exports = {
  User: user;
};
