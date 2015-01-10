/* global require, __dirname, process, console */
var express = require("express"),
	 app = express(),
	 bodyParser = require('body-parser'),
	 path = require('path'),
	 io = require('socket.io')(http),
	 http = require('http'),
	 favicon = require('serve-favicon');

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'node_modules/zeroclipboard/dist')));

// configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// express routes
app.get('/', function (req, res) {
	res.render('index');
	res.sendStatus(200);
});

app.put('/pipe', function (req) {
	var id = req.body.qrpass_id;
	io.sockets.connected[id].emit('qrpass_data', req.body.qrpass_data);
});

// start server
var server = http.createServer(app);
var port = process.env.PORT || 5000;
server.listen(port, function() {
	console.log("listening at port: " + port);
});
io.listen(server);

// socket.io sockets
io.sockets.on('connection', function (socket) {
	socket.emit('qrpass_id', socket.id);
});
