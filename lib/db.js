var mongoose = require('mongoose');

var host = process.env.DB_HOST;
var port = process.env.DB_PORT;
var database = process.env.DB_DATABASE;
var user = process.env.DB_USER;
var password = process.env.DB_PASSWORD;

mongoose.connect("mongodb://" + user + ":" + password + "@" + host + ":" + port + "/" + database, function(err) {
  if (err) {
    console.log('Erorr while connecting to mongo database: ' + err.message);
  }
});
