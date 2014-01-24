var cluster = require('cluster')
  , util = require('util')
  , events = require('events')
  ;

function ClusterAppError(message) {
  this.message = message;
  Error.captureStackTrace(this, ClusterAppError);
}
util.inherits(ClusterAppError, Error);

function args(a) {
  return [].slice.call(a, 0);
}

function App(options) {
  var self = this
    , workers = options && options.workers || require('os').cpus().length
    , timeout = options && options.timeout || 2000
    , respawn = options && options.restart || false
    , evlog   = options && options.evlog || false
    , started = false
    , inited = false
    ;

  function setEvlog(value) {
    evlog = value;
    return self;
  }

  function init(w) {
    if (!w)     throw new ClusterAppError('Empty worker value');
    if (inited)
      throw new ClusterAppError('Already initialized');
    try {
      require.resolve(w)
    } catch (e) {
      throw new ClusterAppError('Wrong worker')
    }
    inited = true;
    cluster.setupMaster({
      exec: w,
      silent: false
    });
    return this;
  }

  function start() {
    if (!inited)  throw new ClusterAppError('Not initialized');
    if (started) throw new ClusterAppError('Already started');
    [
      'fork'
      , 'listening'
      , 'online'
      , 'disconnect'
      , 'exit'
    ].forEach(function (event) {
        cluster.on(event, function (worker) {
          if (evlog)
            util.log('Worker ' + worker.uniqueID + ': ' + event);
          self.emit.apply(self, [event].concat(args(arguments)));
        })
      });

    //timeout implementation
    var timeouts = {};
    self.on('fork',function (worker) {
      timeouts[worker.uniqueID] = setTimeout(function () {
        self.emit('timeout', worker, timeout)
      }, timeout);
    }).on('listening',function (worker) {
      clearTimeout(timeouts[worker.uniqueID]);
    }).on('exit', function (worker) {
      // console.log('self.on(exit)', worker.uniqueID, 'exited')
      clearTimeout(timeouts[worker.uniqueID]);
      if (respawn) cluster.fork();//on exit restart
    });

    for (var i = 0; i < workers; i++) {
      (function (w) {
        w.on('exit',function () {
          if (!Object.keys(cluster.workers).length)
            self.emit('noworkers')
        }).on('message', function (msg) {
          switch (msg.action) {
            case 'stop':
              self.stop();
              break;
            case 'restart':
              self.restart();
              break;
            case 'log':
              self.emit('log', msg.msg);
              break;
          }
        })
      })(cluster.fork())
    }
    self.emit('start');
    started = true;
    return self
  }

  function stop() {
    if (!started) throw new ClusterAppError('Not started');
    var t = respawn;
    respawn = false;
    for (var id in cluster.workers) {
      if (cluster.workers.hasOwnProperty(id)) {
        cluster.workers[id].process.kill();
      }
    }
    self.on('noworkers', function () {
      respawn = t;
    });
    started = false;
    self.emit('stop');
    return self
  }

  function restart() {
    self.on('stop',function () {
      start()
    }).stop();
    return self
  }

  this.init = init;
  this.start = start;
  this.stop = stop;
  this.restart = restart;
  this.setEvlog = setEvlog
}
util.inherits(App, events.EventEmitter);

App.ClusterAppError = ClusterAppError;

module.exports = App;