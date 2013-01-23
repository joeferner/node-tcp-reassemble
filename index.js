'use strict';

var util = require("util");
var events = require("events");

var TcpReassembler = module.exports = function() {
  events.EventEmitter.call(this);
};
util.inherits(TcpReassembler, events.EventEmitter);

TcpReassembler.prototype.push = function(packet) {
  require('assert').fail('implement me');
};
