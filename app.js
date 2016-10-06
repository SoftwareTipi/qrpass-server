/* global require, __dirname, process, console */
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const io = require('socket.io')(http);
const favicon = require('serve-favicon');
const browserify = require('browserify-middleware');

// middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'node_modules/zeroclipboard/dist')));

// configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// express routes
app.get('/', function (req, res) {
	res.render('index');
});

app.get('/index_budle.js', browserify('./browserify/qrpass.js'));

app.put('/pipe', function (req, res) {
	var id = req.body.qrpass_id;
	if (io.sockets.connected[id]) {
		io.sockets.connected[id].emit('qrpass_data', req.body.qrpass_data);
		res.sendStatus(200);
	} else {
		res.sendStatus(400);
	}
});

// start server
var server = http.createServer(app);
var port = process.env.PORT || 5000;
server.listen(port, function () {
	console.log("listening at port: " + port);
});
io.listen(server);

// socket.io sockets
io.sockets.on('connection', function (socket) {
	socket.emit('qrpass_id', socket.id);
});
