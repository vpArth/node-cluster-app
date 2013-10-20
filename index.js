var cluster = require('cluster')
  , util    = require('util')
  , events  = require('events')

function ClusterAppError(message){
  this.message = message;
  Error.captureStackTrace(this, ClusterAppError);
}
util.inherits(ClusterAppError, Error)

function args(a){
  var r = []
  for(var i in a) r[i] = a[i];
  return r
}

function App(options){
  var self = this
    , workers = options && options.workers || require('os').cpus().length
    , timeout = options && options.timeout || 2000
    , respawn = options && options.restart || false
    , evlog   = options && options.evlog   || false
    , started = false

  function setEvlog(value){ 
    evlog = value
  }

  function init(w){
    if(!w)     throw new ClusterAppError('Empty worker value')
    if(typeof worker!='undefined') 
      throw new ClusterAppError('Already initialized')
    try{
      require.resolve(w)
    } catch(e){
      throw new ClusterAppError('Wrong worker')
    }
    worker = w;
    cluster.setupMaster({
      exec : worker,
      silent : false
    })
  }
  function start(){
    if(typeof worker=='undefined')  throw new ClusterAppError('Empty worker value')
    if(started) throw new ClusterAppError('Already started')
    ;[
      'fork'
    , 'listening'
    , 'online'
    , 'disconnect'
    , 'exit'
    ].forEach(function(event){
      cluster.on(event, function(worker){
        if(evlog)
          util.log('Worker '+worker.uniqueID + ': ' + event)
        self.emit.apply(self, [event].concat(args(arguments)));
      })
    })

    //timeout implementation
    var timeouts = {};
    self.on('fork', function(worker){
      timeouts[worker.uniqueID] = setTimeout(function(){
        self.emit('timeout', worker, timeout)
      }, timeout);
    }).on('listening', function(worker){
      clearTimeout(timeouts[worker.uniqueID]);
    }).on('exit', function(worker){
      // console.log('self.on(exit)', worker.uniqueID, 'exited')
      clearTimeout(timeouts[worker.uniqueID]);
      if(respawn) cluster.fork();//on exit restart
    })    

    for(var i=0; i<workers; i++ ) {
      (function(w){
        w.on('exit', function(){
          if(!Object.keys(cluster.workers).length)
            self.emit('noworkers')
        }).on('message', function(msg){
          switch(msg.action){
            case 'stop':    return self.stop();
            case 'restart': return self.restart();
            case 'log':     return self.emit('log', msg.msg);
          }
        })
      })(cluster.fork())
    }
    self.emit('start')
    started = true;
  }

  function stop(){
    if(!started) throw new ClusterAppError('Not started')
    var t = respawn
    respawn = false
    for(var i in cluster.workers){
      cluster.workers[i].process.kill()
    }
    self.on('noworkers', function(){
      respawn = t;
    })
    started = false;
    self.emit('stop')
  }

  function restart(){
    self.on('stop', function(){
      start()
    }).stop()
  }
  this.init      = init
  this.start     = start
  this.stop      = stop
  this.restart   = restart
  this.setEvlog  = setEvlog
}
util.inherits(App, events.EventEmitter)

App.ClusterAppError = ClusterAppError

module.exports = App