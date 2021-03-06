const child_process = require('child_process')
let awaitedRequests = {}

module.exports = class ImageProcess {
  constructor(debug) {
    this.debug = debug
  }

  init() {
    let proc = child_process.fork('./ip.js', { silent: true })
    if(this.debug) proc.on('disconnect', () => console.log(`[IMG ${proc.pid}]`, 'disconnected'))
    proc.on('error', err => console.log(`[IMG ${proc.pid}]`, 'error:', err))
    return proc
  }

  async send(msg){
    let proc = this.init()
    proc.send(msg)
    let m = await this.wait(proc)
    return m
  }

  wait(proc) {
    return new Promise((resolve, reject) => {
      proc.on('message', msg => {
        if(msg.code === "log") console.log(`[IMG ${proc.pid}]`, ...msg.log)
        if(msg.code === "ok"){
          if(this.debug) console.log(`[IMG ${proc.pid}]`, 'loaded')
          proc.stdout.on('data', data => {
            console.log(`[IMG ${proc.pid} to MAIN]`, data.toString())
          })
        };
        if(msg.status === 'fail') {
          console.log(`[IMG ${proc.pid}]`, 'file error:', msg.err)
          reject({ message: msg.message, stack: msg.err, msg, toString() { return msg.message } })
        }
        if(msg.quit) {
          proc.kill()
          if(this.debug) console.log(`[IMG ${proc.pid}]`, `done "${msg.code}" in ${msg.uptime} seconds`)
          resolve(msg)
        }
      })
    });
  }

  sendMessage(msg) {
    return new Promise((resolve, reject) => {
      this.send(msg).then(res => {
        resolve(new Buffer(res.buffer, 'base64'), res);
      }).catch(reject);
    });
  }
}