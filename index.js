(async ()=>{

const express = require('express')
const path = require('path')
const app = express()
const config = require('./config')
const ipm = require('./ipm')
const db = new (require('./db'))()
const fs = require('fs')
const http = require('http').Server(app)
const bodyParser = require('body-parser')
const tokengen = require('token-generator')(config.tg)
const { FolderIterator } = require('struct')

let ips = {
  main: new ipm('main')
}

ips.main.init()

if(config.ips) config.ips.map(name => {
  ips[name] = new ipm(name)
  ips[name].init()
})

await db.connect(config.r)
app.set("json spaces", 4)
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*"
  })
  Object.assign(req, { db, config, processes: ips, tokengen })
  return next()
})


let iterator = new FolderIterator(config.routePath, (path, iter) => {
  console.log('====================================')
  console.log('Path:', path)
  console.log('Using Route:', path.slice(iter.path.length, -3))
  app.use('/v1' + path.slice(iter.path.length, -3).split('\\').join('/'), require(path))
})

await iterator.iterate()
console.log('Done adding routes')

app.listen(config.port, () => {
  console.info('Running on port', config.port)
})

})()