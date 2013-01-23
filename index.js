'use strict';

var util = require("util");
var events = require("events");

var hostAIp = null;
var hostBIp = null;

var tcpStream; 

var TcpReassembler = module.exports = function() {
  events.EventEmitter.call(this);
  tcpStream = new events.EventEmitter();
};
util.inherits(TcpReassembler, events.EventEmitter);

TcpReassembler.prototype.push = function(packet) {
  // Check to see if this is the first packet.

  if (!hostAIp && !hostBIp) {
  	hostAIp = packet.ip.source;
  	hostBIp = packet.ip.dest;
    this.emit('tcpStream', tcpStream);
  }
  var emitMessage;
  if (packet.ip.source === hostAIp) {
  	emitMessage = 'dataAtoB';
  } else {
  	emitMessage = 'dataBtoA';
  }
  emitData(packet, emitMessage);
};

function emitData (packet, emitMessage) {
  if (packet.tcp.fin) {
    emitMessage = 'end';
  }
  tcpStream.emit(emitMessage, packet.tcp.data);
};