var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;

var coinflipSchema = new Schema({
  id_creator: {type: String, required: true},
  id_joiner: {type: String},
  starting_face: {type: Number}, //1 = tails, 0 = heads
  winning_face: {type: Number},
  amount: {type: Number},
  id_winner: {type: String},
  hash_code: {type: String},
  completed: {type: Boolean, required: true, default: false},
  date_created: {type: Date, default: Date.now, required: true},
  date_completed: {type: Date, required: false}
});

coinflipSchema.statics.getUserHistory = function(userId, limit, done) {
  return this.find({ completed: true }).or([{ id_creator: userId }, { id_joiner: userId }]).sort({date_completed: -1}).limit(limit).exec(done);
};

coinflipSchema.statics.getRecentGames = function(limit, done) {
  return this.find({ completed: true }).sort({date_completed: -1}).limit(limit).exec(done)
};

coinflipSchema.statics.getOpenGames = function(done) {
  return this.find({ completed: false }).exec(done);
}

coinflipSchema.plugin(autoIncrement.plugin, 'Coinflip');

var Coinflip = mongoose.model('Coinflip', coinflipSchema);

module.exports = {
  Coinflip: Coinflip
};
