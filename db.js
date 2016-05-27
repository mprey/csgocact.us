var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({

});

mongoose.model('Game', gameSchema);

var userSchema = new Schema({

});

mongoose.model('User', userSchema);

var transferSchema = new Schema({

});

mongoose.model('Transfer', transferSchema);

mongoose.connect("mongodb://localhost:27017/test");
