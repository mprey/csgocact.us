var mongoose = require('mongoose');

var host = process.env.DB_HOST;
var port = process.env.DB_PORT;
var coll = process.env.DB_COLL;

mongoose.connect("mongodb://" + host + ":" + port + "/" + coll, function(err) {
  if (err) {
    console.log('Erorr while connecting to mongo database: ' + err.message);
  }
});
