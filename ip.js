const fs = require('fs')
const path = require('path')
const config = require('./config')

class CodeLoader {
  constructor(im, cPath){
    this.codes = new Map()
    this.path = path.resolve(cPath)
    this.debug = im.debug
    this.im = im
  }

  iterateFolder(folderPath){
    let files = fs.readdirSync(folderPath);
    files.map(file => {
      let filePath = path.join(folderPath, file)
      let stat = fs.lstatSync(filePath)
      if(stat.isSymbolicLink()){
        let realPath = fs.readlinkSync(filePath)
        if(stat.isFile() && file.endsWith('.js')) {
          loadCode(realPath)
        }else if(stat.isDirectory()){
          this.iterateFolder(realPath)
        }
      }else if(stat.isFile() && file.endsWith('.js')){
        this.loadCode(filePath)
      }else if(stat.isDirectory()){
        this.iterateFolder(filePath)
      }
    });
  }

  loadCode(path){
    if(this.debug) console.log('Loading code', path)
    delete require.cache[require.resolve(path)]
    let router = require(path)
    if(!router.imageprocess) return
    let code = new router.imageprocess(this.im)
    code.path = path
    this.codes.set(code.constructor.name, code)
  }

  reload(){
    this.codes.clear()
    this.iterateFolder(this.path)
  }
}

class ImageMaster {
  constructor(){
    this.sharded = false
    this.cl = new CodeLoader(this, config.routePath)

    process.on("message", this.process.bind(this))
    process.once('SIGINT', () => process.exit(0))
    process.on('unhandledRejection', (reason, p) => console.log("Unhandled Rejection at ", p, 'reason ', reason))
    process.once('uncaughtException', err => {
      this.error('Uncaught Exception:', err)
      setTimeout(() => process.exit(0), 2500)
    })

    process.send({ code: 'ok' })
  }

  async process(msg) {
    try {
      Object.keys(msg).map(k => {
        if(msg[k] && msg[k].type === "Buffer") msg[k] = new Buffer(msg[k].data);
      })

      if(msg.code === 'start') {
        console.log('Given initialize message')
        this.cl.reload()
        return
      }

      if(!this.cl.codes.has(msg.code)) return this.sendError(msg, new Error('Nonexistant code.'), 'master', true)

      try {
        await this.cl.codes.get(msg.code).process(msg, this)
      } catch(e) {
        this.sendError(msg, e)
      }
    } catch(e) {
      process.send({code:'log',log:['critical error',e.stack]})
    }
  }
  
  sendError(msg, err, level = 'code') {
    msg.status = 'fail'
    msg.fail_level = level
    msg.message = err.message
    msg.err = err.stack
    msg.special = err.special
    process.send(msg)
  }
}

new ImageMaster()