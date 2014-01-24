var ClusterApp = require('..')
  , util = require('util');

var tool = new ClusterApp({
  restart: true,
  evlog: true
});
tool.init(__dirname + '/../tests/httpworker.js');

tool.on('start',function () {
  util.log('Application started')
}).on('stop',function () {
  util.log('Application stopped')
}).on('listening',function (worker, address) {
  util.log('Worker ' + worker.uniqueID + ': listen ' + address.port)
}).on('log', function (msg) {
  util.log('Request: ' + msg)
});

tool.start();
