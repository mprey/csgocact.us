var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var depositSchema = new Schema({
  userId: { type: String, required: true },
  items: [{
    assetid: String,
    price: Number,
    icon_url: String,
    market_hash_name: String
  }],
  amount: { type: Number, required: true },
  trade_url: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  accepted:  { type: Boolean, required: true, default: false },
  date: { type: Date, required: true, default: Date.now }
});

depositSchema.statics.hasOpenDeposit = function(userId, callback) {
  this.find({
    userId: userId,
    completed: false
  }, (err, docs) => {
    if (err) {
      return callback(true);
    }
    return callback(docs && docs.length > 0);
  });
}

depositSchema.statics.completeDeposit = function(userId, accepted, callback) {
  this.findOneAndUpdate({
    userId: userId,
    completed: false
  }, {
    completed: true,
    accepted: accepted
  }, {
    new: true
  }, (err, doc) => {
    return callback(err, doc);
  });
}

var Deposit = mongoose.model('Deposit', depositSchema);

module.exports = {
  Deposit: Deposit
};
