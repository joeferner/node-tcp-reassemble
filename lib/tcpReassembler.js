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
  tcpParseStream.on('packet', function (packet) {
    packetCount++;
    if (!packet.tcp) {
      return;
    }
    self.push({ip: packet.ip, tcp: packet.tcp, http: packet.http});
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
  } else if (packet.ip.source === existingStream.sourceIP) {
    emitMessage = 'dataAtoB';
  } else {
    emitMessage = 'dataBtoA';
  }
  if (packet.http){
    if (packet.http.method) {
      emitMessage = 'httpRequest';
    } else if (packet.http.status_code) {
      emitMessage = 'httpResponse';  
    }   
  }
  existingStream.emitData(packet, emitMessage, function () {
    completedPacketCount++;
  });
};
