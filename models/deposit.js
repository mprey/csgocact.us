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
  completed: { type: Boolean, required: true, default: false },
  date: { type: Date, required: true, default: Date.now }
});

var Deposit = mongoose.model('Deposit', depositSchema);

module.exports = {
  Deposit: Deposit
};
