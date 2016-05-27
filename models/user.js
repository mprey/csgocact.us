var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
  userid: {type: String, required: true},
  total_bets: {type: Number, required: true, default: 0},
  total_wagered: {Type}
  date_joined: {type: Date, default: Date.now, required: true}
});

var User = mongoose.model('User', user);

module.exports = {
  User: user;
};
