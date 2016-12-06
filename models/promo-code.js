var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var promoCodeSchema = new Schema({
  code: {type: String, required: true},
  amount: {type: Number, required: true, default: 0.50},
  expire: {type: Date, required: false}
});

promoCodeSchema.methods.isExpired = function() {
  if (this.expire) {
    var expireDate = Date.parse(this.expire);
    if (expireDate < new Date()) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

promoCodeSchema.statics.getPromoCode = function(input, callback) {
  this.findOne({
    code: input
  }, function(err, code) {
    if (!err && code) {
      return callback(code);
    }
    return callback();
  });
};

var PromoCode = mongoose.model('promo_code', promoCodeSchema);

module.exports = {
  PromoCode: PromoCode
}
