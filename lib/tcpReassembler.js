var util = require("util");
var events = require("events");
var async = require("async");

var hostAIp = null;
var hostBIp = null;

var tcpStream = require('./tcpStream'); 

var tcpStreamArray;
var packetCount = 0;
var completedPacketCount = 0;

var TcpReassembler = module.exports = function() {
  events.EventEmitter.call(this);
  tcpStreams = {};
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
  var packetQueue = async.queue(function (packet, callback) {
    process.nextTick(function(){
      self.push({ip: packet.ip, tcp: packet.tcp, http: packet.http}, callback)
    });
  }, 100);

  tcpParseStream.on('packet', function (packet) {
    if (!packet.tcp) {
      return;
    }
    packetCount++;
    packetQueue.push(packet);
  });
  tcpParseStream.on('end', function () {
    wait(self);
  });
}

TcpReassembler.prototype.push = function(packet, callback) {
  // Look for a matching tcpStream
  var existingStream = null;
  var searchString1 = packet.ip.source + ":" + packet.tcp.sourcePort + "|" + packet.ip.dest + ":" + packet.tcp.destPort;
  var searchString2 = packet.ip.dest + ":" + packet.tcp.destPort + "|" + packet.ip.source + ":" + packet.tcp.sourcePort;
  if (tcpStreams[searchString1]){
    existingStream = tcpStreams[searchString1];
  } else if (tcpStreams[searchString2]){
    existingStream = tcpStreams[searchString2];
  } else {
    //Create a new stream.
    existingStream = tcpStreams[searchString1] = new tcpStream(packet.ip.source, packet.ip.dest);
    this.emit('tcpStream', existingStream);
  }

  var emitMessage;
  if (!packet.tcp) {
    completedPacketCount++;
    if (callback) {
      return callback();  
    }
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
  return existingStream.emitData(packet, emitMessage, function () {
    if (emitMessage === 'end') {
      delete tcpStreams[searchString1];
      delete tcpStreams[searchString2];
    }

    completedPacketCount++;
    if (callback) {
      return callback();  
    }
    return;
  });
};
