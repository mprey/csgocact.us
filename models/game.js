var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
  id_creator: {type: String, required: true},
  id_joiner: {type: String},
  amount: {type: Number, required: true},
  id_winner: {type: String, required: true},
  date_created: {type: Date, default: Date.now, required: true}
});

var Game = mongoose.model('Game', gameSchema);

module.exports = {
  Game: Game;
};
