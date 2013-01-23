var util = require("util");
var events = require("events");

var hostAIp = null;
var hostBIp = null;

var tcpStream = require('./tcpStream'); 

var tcpStreamArray;

var TcpReassembler = module.exports = function() {
  events.EventEmitter.call(this);
  tcpStreamArray = new Array();
};
util.inherits(TcpReassembler, events.EventEmitter);

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
  if (packet.ip.source === existingStream.sourceIP) {
  	emitMessage = 'dataAtoB';
  } else {
  	emitMessage = 'dataBtoA';
  }
  existingStream.emitData(packet, emitMessage);
};