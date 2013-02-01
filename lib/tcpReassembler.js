var util = require("util");
var events = require("events");

var hostAIp = null;
var hostBIp = null;

var tcpStream = require('./tcpStream'); 

var tcpStreamArray;
var packetCount = 0;
var completedPacketCount = 0;

var TcpReassembler = module.exports = function() {
  events.EventEmitter.call(this);
  tcpStreamArray = new Array();
};
util.inherits(TcpReassembler, events.EventEmitter);

var wait = function (self) {
  if (packetCount === completedPacketCount) {
    self.emit('end');   
  } else {
    setTimeout(wait.bind(null, self), 1000);
  }
}

TcpReassembler.prototype.processStream = function (tcpParseStream) {
  var self = this;
  // console.log("got stream");
  tcpParseStream.on('packet', function (packet) {
    packetCount++;
    self.push({ip: packet.ip, tcp: packet.tcp});
  });
  tcpParseStream.on('end', function () {
    wait(self);
  });
}

TcpReassembler.prototype.push = function(packet) {
  // Look for a matching tcpStream
  var existingStream = null;
  tcpStreamArray.forEach(function(stream) {
    if (stream.sourceIP === packet.ip.source && stream.destinationIP === packet.ip.dest ||
        stream.sourceIP === packet.ip.dest && stream.destinationIP === packet.ip.source) {
      existingStream = stream;
    }
  });
  if (!existingStream) {
    //Create a new stream.
    existingStream = new tcpStream(packet.ip.source, packet.ip.dest);
    tcpStreamArray.push(existingStream);
    this.emit('tcpStream', existingStream);
  }
  var emitMessage;
  if (!packet.tcp) {
    completedPacketCount++;
    return;
  }
  if (packet.tcp.isFIN) {
    emitMessage = 'end';
  } else if (packet.tcp.data.toString().indexOf("GET ") >= 0){
    emitMessage = 'httpRequest';
  } else if (packet.tcp.data.toString().indexOf("HTTP") >= 0) {
    emitMessage = 'httpResponse';
  } else if (packet.ip.source === existingStream.sourceIP) {
    emitMessage = 'dataAtoB';
  } else {
    emitMessage = 'dataBtoA';
  }
  existingStream.emitData(packet, emitMessage, function () {
      completedPacketCount++;
  });
};