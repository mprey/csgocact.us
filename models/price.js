var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var priceSchema = new Schema({
  market_hash_name: String,
  price: Number
});

var Price = mongoose.model('Price', priceSchema);

module.exports = {
  Price: Price
};
