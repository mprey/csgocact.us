var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinflipSchema = new Schema({
  id_creator: {type: String, required: true},
  id_joiner: {type: String},
  starting_face: {type: Number, required: true, default: "1"}, //1 = heads, 0 = tails
  winning_face: {type: Number, required: false},
  amount: {type: Number, required: true},
  id_winner: {type: String, required: false},
  completed: {type: Boolean, required: true, default: false},
  date_created: {type: Date, default: Date.now, required: true}
});

coinflipSchema.methods.hasCompleted = function(callback) {
  return callback(this.completed == true);
};

coinflipSchema.methods.isAvailable = function(callback) {
  return callback(this.id_joiner == null);
};

var Coinflip = mongoose.model('Coinflip', coinflipSchema);

module.exports = {
  Coinflip: Coinflip
};
