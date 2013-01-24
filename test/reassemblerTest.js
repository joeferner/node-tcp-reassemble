'use strict';

var TcpReassembler = require('../').TcpReassembler;

module.exports = {
  "reassemble packets": function(test) {
    var a = '145.254.160.237';
    var b = '65.208.228.223';
    var c = '65.206.233.233';
    var arrayAtoB = new Array();
    var arrayBtoA = new Array();
    var arrayBtoC = new Array();
    var arrayCtoB = new Array();
    var reassembler = new TcpReassembler();

    reassembler.on('tcpStream', function(tcpStream) {
      if (tcpStream.sourceIP === a && tcpStream.destinationIP === b) {
        tcpStream.on('dataAtoB', function(message) {
          arrayAtoB.push(message.data.toString());
        });
        tcpStream.on('dataBtoA', function(message) {
          arrayBtoA.push(message.data.toString());
        });
        tcpStream.on('end', function() {
          test.equal(arrayAtoB.length, 5);
          test.equal(arrayBtoA.length, 4);
          test.equal(arrayBtoC.length, 1);
          test.equal(arrayCtoB.length, 1);
          test.notEqual(arrayAtoB.indexOf('hostA to hostB (1)'), -1);
          test.equal(arrayAtoB.indexOf('hostA to hostB (2)'), -1);
          test.equal(arrayBtoA.indexOf('hostA to hostB (1)'), -1);
          test.notEqual(arrayBtoA.indexOf('hostB to hostA (1)'), -1);
          test.notEqual(arrayBtoA.indexOf('hostB to hostA (2)'), -1);
          test.notEqual(arrayBtoC.indexOf('hostB to hostC (1)'), -1);
          test.notEqual(arrayCtoB.indexOf('hostC to hostB (1)'), -1);
          test.done();
        });
      } else if (tcpStream.sourceIP === b && tcpStream.destinationIP === c) {
        tcpStream.on('dataAtoB', function(message) {
          arrayBtoC.push(message.data.toString());
        });
        tcpStream.on('dataBtoA', function(message) {
          arrayCtoB.push(message.data.toString());
        });
      } else {
        test.fail("Invalid handling of tcpStreams");
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951057939,
        data: new Buffer(0),
        isFIN: false,
        isACK: false,
        isPSH: false,
        isSYN: true
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290218379,
        ack: 951057940,
        data: new Buffer(0),
        isFIN: false,
        isACK: true,
        isPSH: false,
        isSYN: true
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '65.206.233.233' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290218379,
        ack: 951057940,
        data: new Buffer('hostB to hostC (1)')
      }
    });

    reassembler.push({
      ip: { source: '65.206.233.233', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951057939,
        data: new Buffer('hostC to hostB (1)')
      }
    });


    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951057940,
        ack: 290218380,
        data: new Buffer(0),
        isFIN: false,
        isACK: true,
        isPSH: false,
        isSYN: false
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951057940,
        ack: 290218380,
        data: new Buffer('hostA to hostB (1)'),
        isFIN: false,
        isACK: true,
        isPSH: true,
        isSYN: false
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290218380,
        ack: 951058419,
        data: new Buffer(0),
        isFIN: false,
        isACK: true,
        isPSH: false,
        isSYN: false
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290218380,
        ack: 951058419,
        data: new Buffer('hostB to hostA (1)'),
        isFIN: false,
        isACK: true,
        isPSH: false,
        isSYN: false
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951058419,
        ack: 290219760,
        data: new Buffer(0),
        isFIN: false,
        isACK: true,
        isPSH: false,
        isSYN: false
      }
    });

    reassembler.push({
      ip: { source: '65.208.228.223', dest: '145.254.160.237' },
      tcp: {
        sourcePort: 80,
        destPort: 3372,
        seq: 290219760,
        ack: 951058419,
        data: new Buffer('hostB to hostA (2)'),
        isFIN: false,
        isACK: true,
        isPSH: false,
        isSYN: false
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951058419,
        ack: 290221140,
        data: new Buffer(0),
        isFIN: false,
        isACK: true,
        isPSH: false,
        isSYN: false
      }
    });

    reassembler.push({
      ip: { source: '145.254.160.237', dest: '65.208.228.223' },
      tcp: {
        sourcePort: 3372,
        destPort: 80,
        seq: 951058419,
        ack: 290221140,
        fin: true,
        data: new Buffer(0)
      }
    });
  }
};
