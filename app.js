var express = require("express"),
	 app = express(),
	 bodyParser = require('body-parser'),
	 path = require('path'),
	 io = require('socket.io')(http),
	 http = require('http');

// middleware
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'static')));

// configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// express routes
app.get('/', function (req, res) {
	res.render('index');
});

app.put('/pipe', function (req) {
	var id = req.body.qrpass_id;
	io.sockets.connected[id].emit('qrpass_data', req.body.qrpass_data);
});

// start server
var server = http.createServer(app);
server.listen(app.get('port'));
io.listen(server);

// socket.io sockets
io.sockets.on('connection', function (socket) {
	socket.emit('qrpass_id', socket.id);
});
