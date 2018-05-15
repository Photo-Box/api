const child_process = require('child_process')
let awaitedRequests = {}

module.exports = class ImageProcess {
  constructor(name){
    this.name = name
  }

  init() {
    console.log(`[IMG ${this.name}]`, 'Initilizing process')
    this.process = child_process.fork('./ip.js', { silent: true })
    this.process.on('message', this.onMessage.bind(this))
    this.process.on('disconnect', this.onDisconnect.bind(this))
    this.process.on('error', err => console.log(`[IMG ${this.name}]`, 'ERROR GIVEN:', err))
    this.process.send({ code: 'start' })
  }

  send(msg){
    if(!msg.id) msg.id = Date.now().toString(16)
    return new Promise((resolve, reject) => {
      if(!this.process.connected) reject(new Error('Image process not connected.'));
      if(!msg._timeout) msg._timeout = 60000;
      let timeout = msg._timeout;
      let timer = setTimeout(function() {
        delete awaitedRequests[msg.id];
        console.log("Time out", msg.id, new Error('Request timed out: '+timeout+'ms'))
        reject(new Error('Request timed out: '+timeout+'ms'));
      }, timeout);
      if (awaitedRequests[msg.id]) awaitedRequests[msg.id].reject(new Error('Request was overwritten'))
      awaitedRequests[msg.id] = {
        resolve: function(msg2) { clearTimeout(timer); resolve(msg2); },
        reject: function(e) { clearTimeout(timer); reject(e); }
      };
      delete msg._timeout;
      if(this.debug) console.log("Sending to image process", msg);
      this.process.send(msg);
    });
  }

  sendMessage(msg){
    return new Promise((resolve, reject) => {
      this.send(msg).then(res => {
        resolve(new Buffer(res.buffer, 'base64'), res);
      }).catch(reject);
    });
  }

  kill(){
    this.process.kill('SIGHUP');
  }

  onMessage(msg) {
    if(msg.code === "log") return console.log(`[IMG ${this.name}]`, ...msg.log)
    if(msg.code === "ok"){
      console.log(`[IMG ${this.name}]`, 'Process loaded')
      this.process.stdout.on('data', data => {
        //console.log("coughtlog", data)
        console.log(`[IMG ${this.name} to MAIN]`, data.toString())
      })
      return;
    };
    //if(this.debug) console.log("Main cought msg", msg);
    if (awaitedRequests.hasOwnProperty(msg.id)) {
      if(msg.status == 'success'){
        awaitedRequests[msg.id].resolve(msg);
      }else{
        awaitedRequests[msg.id].reject({ message: msg.message, stack: msg.err, msg, toString() { return msg.message } });
      }
    }
  }

  onDisconnect() {
    console.log(`[IMG ${this.name}]`, 'Disconnected. Reconnecting in 10 seconds...')
    setTimeout(() => this.init(), 10000)
  }
}