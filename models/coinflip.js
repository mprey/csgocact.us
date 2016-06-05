var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinflipSchema = new Schema({
  id_creator: {type: String, required: true},
  id_joiner: {type: String},
  starting_face: {type: String, required: true, default: "heads"},
  winning_face: {type: String, required: false},
  amount: {type: Number, required: true},
  id_winner: {type: String, required: false},
  completed: {type: Boolean, required: true, default: false},
  date_created: {type: Date, default: Date.now, required: true}
});

var Coinflip = mongoose.model('Coinflip', coinflipSchema);

module.exports = {
  Coinflip: Coinflip
};
