require('dotenv').config();

var express = require('express');
var app = express();
var http = require('http');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');

var bodyParser = require('body-parser');
var session = require('express-session');
var sassMiddleware = require('node-sass-middleware');
var MongoStore = require('connect-mongo')(session);
var banMiddleware = require('./lib/ban-middleware');
var pjax = require('./lib/pjax-middleware');

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

require('./lib/passport')(passport);
require('./lib/db')(mongoose);

var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

var sassMiddleware = sassMiddleware({
  src: path.join(__dirname, 'public/sass'),
  dest: path.join(__dirname, 'public/stylesheets'),
  debug: false,
  outputStyle: 'compressed',
  prefix:  '/stylesheets'
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(banMiddleware);
app.use(pjax());
app.use(sassMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

require('./router')(app);

server.listen(port || 3000);

io.use(function(socket, next) {
  sessionMiddleware(socket.request, {}, next);
});

require('./lib/socket')(io);
