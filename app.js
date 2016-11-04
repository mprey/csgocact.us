/**
 *  Set up process.env variables
 */
require('dotenv').config();

var express = require('express');
var app = express();
var http = require('http');
var socketio = require('socket.io');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');

var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var server = http.createServer(app);
var io = socketio.listen(server);

require('./lib/passport')(passport);
require('./lib/db')(mongoose);

var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var sessionMiddleware = session({
  key: 'connect.sid',
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: true,
  saveUninitialized: true
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

require('./router')(app);

server.listen(port, function() {
  console.log(process.env.APP_NAME + ' running on port: ' + port);
});

io.use(function(socket, next) {
  console.log('request');
  sessionMiddleware(socket.request, socket.request.res, next);
});

require('./lib/socket')(io);
