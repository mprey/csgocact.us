var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var coinflipSchema = new Schema({
  id_creator: {type: String, required: true},
  id_joiner: {type: String},
  starting_face: {type: Number}, //1 = tails, 0 = heads
  winning_face: {type: Number},
  amount: {type: Number},
  id_winner: {type: String},
  completed: {type: Boolean, required: true, default: false},
  date_created: {type: Date, default: Date.now, required: true}
});

coinflipSchema.methods.hasCompleted = function() {
  return (this.completed == true);
};

coinflipSchema.methods.isAvailable = function() {
  return (this.id_joiner == null);
};

coinflipSchema.methods.joinGame = function(userId, done) {
  this.id_joiner = userId;
  this.save(done);
};

coinflipSchema.methods.setWinningFace = function(face, done) {
  this.winning_face = face;
  this.completed = true;
  if (this.starting_face == this.winning_face) {
    this.id_winner = this.id_creator;
  } else {
    this.id_winner = this.id_joiner;
  }
  this.save(done);
}

coinflipSchema.statics.getUserHistory = function(userId, limit, done) {
  return this.find({ completed: true }).or([{ id_creator: userId }, { id_joiner: userId }]).limit(limit).exec(done);
};

coinflipSchema.statics.getRecentGames = function(limit, done) {
  return this.find({ completed: true }).sort('-date').limit(limit).exec(done)
};

coinflipSchema.statics.getOpenGames = function(done) {
  return this.find({ completed: false }).exec(done);
}

var Coinflip = mongoose.model('Coinflip', coinflipSchema);

module.exports = {
  Coinflip: Coinflip
};
