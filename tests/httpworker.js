var http = require('http')
  , util = require('util')
  , events = require('events')
  , Url = require('url')
  , qs = require('querystring')
  ;

function HttpWorker() {
  var self = this;

  function start() {
    var s = http.createServer(function (req, res) {
      process.send({
        action: 'log',
        msg:    req.method + ' ' + req.url
      });
      req.url = Url.parse(req.url);
      req.params = qs.parse(req.url.query);
      switch (req.params.action) {
        case 'stop':
          res.write('Stopped');
          res.end();
          process.send({
            action: 'stop'
          });
          break;
        case 'restart':
          res.write('Stopped');
          res.end();
          process.send({
            action: 'restart'
          });
          process.exit(1);
          break;
        default:
          res.write('Hello, world')
      }
      res.end();
    });
    s.listen(6868, function () {
      self.emit('listen', s.address())
    })
  }

  this.start = start
}
util.inherits(HttpWorker, events.EventEmitter);


module.exports = HttpWorker;

var p = new HttpWorker();
p.on('listen', function (address) {
  // util.log(util.format('[HttpWorker] Listen %s', address.port))
});
p.start();
