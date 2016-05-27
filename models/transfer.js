var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var transferSchema = new Schema({
  userid: {type: String, required: true},
  date_created: {type: Date, default: Date.now, required: true}
});

var Transfer = mongoose.model('Transfer', transferSchema);

module.exports = {
  Transfer: Transfer;
};
