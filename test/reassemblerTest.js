'use strict';

var TcpReassembler = require('../');

module.exports = {
  "reassemble packets": function(test) {
    var reassembler = new TcpReassembler();
    reassembler.on('tcpStream', function(tcpStream) {
      tcpStream.on('dataAtoB', function(data) {
        test.fail('test data');
      });
      tcpStream.on('dataBtoA', function(data) {
        test.fail('test data');
      });
      tcpStream.on('end', function() {
        test.done();
      });
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951057939,
        data: new Buffer(0)
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290218379,
        ack: 951057940,
        data: new Buffer(0)
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951057940,
        ack: 290218380,
        data: new Buffer(0)
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951057940,
        ack: 290218380,
        data: new Buffer('hostA to hostB (1)')
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290218380,
        ack: 951058419,
        data: new Buffer(0)
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290218380,
        ack: 951058419,
        data: new Buffer('hostB to hostA (1)')
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951058419,
        ack: 290219760,
        data: new Buffer(0)
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290219760,
        ack: 951058419,
        data: new Buffer('hostB to hostA (2)')
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951058419,
        ack: 290221140,
        data: new Buffer(0)
      }
    });
  }
};
