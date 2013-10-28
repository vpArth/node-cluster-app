[![Build Status](https://travis-ci.org/vpArth/node-cluster-app.png?branch=master)](https://travis-ci.org/vpArth/node-cluster-app)
[![NPM version](https://badge.fury.io/js/node-cluster-app.png)](http://badge.fury.io/js/node-cluster-app)
node-cluster-app
================

#Basic nodejs application using cluster
## Install
  `npm install node-cluster-app`

##Usage:

```javascript
var ClusterApp = require('node-cluster-app')

var app = new ClusterApp({
  workers: 2,
  timeout: 2000,
  restart: true,
  evlog:   false
})
app.init('worker.js')
app.start()

```
Also view sample app in the [examples][] directory

##Constructor options
  * `workers` - workers number (default: cpu number)
  * `timeout` - timeout for `timeout` event
  * `restart` - automatically restart died workers
  * `evlog`   - log native [cluster][] events to console

##Methods
  ClusterApp is [EventEmitter][], so we have all it methods as `emit`, `on` etc.
  * `init` - assign worker
    - `worker` - path to worker's js file
  * `start` - forks neccessary number of workers
  * `stop` - kill all workers
  * `restart` - Sequentially run of `stop` and `start`
  * `setEvlog` - Set mode of logging all inherited from [cluster][] events by util.log
    - `value` - boolean value(default: false)

##Events
**ClusterApp reemitted all native [cluster][] events:**
  * `fork` - new worker forked
  * `online` - worker become online
  * `listening` - worker become listen
  * `disconnect` - worker disconnect
  * `exit` - worker exited
  * `setup` - cluster `setupMaster` was executed

**Also it has a number own events:**
  * `timeout` - Emited on worker not emit `listen` event longer than timeout value
    - `worker` - [Worker object][]
    - `timeout` - Value of applied timeout in ms
  * `start` - Emited on app started
  * `stop` - Emited on app stopped
  * `noworkers` - Emitted on last worker `exit`
  * `log` - worker initiate `log` action
    - `msg` - message by worker provided

## Worker API
Worker is a simple nodejs executable.
It can to talk with a ClusterApp throw standard `process.send(msg)` mechanism
Commands transferred by `msg.actions` param
For now supports next commands:
  * `stop` - Initiate stopping of the ClusterApp
  * `restart` - Initiate restarting of the ClusterApp
  * `log`  - Transfer some data to ClusterApp `log` event
    - `msg` - Provided data
For details you can review sample [httpworker][] in `/tests` directory of this repo

 [cluster]:http://nodejs.org/docs/latest/api/cluster.html
 [EventEmitter]:http://nodejs.org/api/events.html#events_class_events_eventemitter
 [Worker object]:http://nodejs.org/docs/latest/api/cluster.html#cluster_class_worker
 [httpworker]:https://github.com/vpArth/node-cluster-app/blob/master/tests/httpworker.js
 [examples]:https://github.com/vpArth/node-cluster-app/tree/master/examples
