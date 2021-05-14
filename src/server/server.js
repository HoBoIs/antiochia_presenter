
Object.defineProperty(Array.prototype, 'flat', {
  value: function() {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat(toFlatten);
      }, []);
    }
});
const config=require('./config')
const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const path=require('path')

const app = express()
app.use(express.static(config.client_dir))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.broadcast = function broadcast (data) {
  wss.clients.forEach(function each (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

const callbacks = []

wss.on('connection', function connection (ws, req) {
  ws.on('message', function incoming (message) {
    // process.stdout.write('received:'+ message+"\n")
    for (const c of callbacks) {
      c(message, ws)
    }
  })
}) 
ip = Object.values(require("os").networkInterfaces()).
  flat().
  filter((item) => !item.internal && item.family === "IPv4").
  find(Boolean).address


process.stdout.write('Starting server...'+"\n")
server.listen(config.port,'0.0.0.0', function listening () {
  process.stdout.write('Listening on '+ip+":"+ server.address().port+"\n") 
})
var net = require('net');

var portInUse = function(port, callback) {
    var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
    });
    server.listen(port, '0.0.0.0');
    server.on('error', function (e) {
	callback(true);
    });
    server.on('listening', function (e) {
	server.close();
	callback(false);
    });
};

portInUse(80, function(returnValue) {
    process.stdout.write(returnValue+"\n");
});
module.exports = {
  wss,
  subscribe: f => callbacks.push(f),
  broadcast: wss.broadcast
}
