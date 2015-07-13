var static = require('node-static');
var http = require('http');
var file = new(static.Server)();
var port = 2015;
console.log("listening on port: " + port);
var app = http.createServer(function (req, res) {
  file.serve(req, res);
  console.log("served file");
}).listen(port);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket){

  // convenience function to log server messages on the client
	function log(){
		var array = [">>> Message from server: "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message:', message);
    // for a real app, would be room only (not broadcast)
		socket.broadcast.emit('message', message);
	});

	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room ' + room);

		if (numClients === 0){
			socket.join(room);
			socket.emit('created', room);
		} else if (numClients === 1) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		} else { // max two clients
			socket.emit('full', room);
		}
		var string = 'emit(): client ' + socket.id + ' joined room ' + room;
		console.log(string);
		socket.emit(string);
		string = 'broadcast(): client ' + socket.id + ' joined room ' + room;
		console.log(string);
		socket.broadcast.emit(string);

	});

});

