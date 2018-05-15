const fs = require('fs')
const path = require('path')

module.exports = class FolderIterator {
  constructor(ipath, cb){
    this.cb = cb
    this.path = path.resolve(ipath)
  }

  iterateFolder(folderPath){
    let files = fs.readdirSync(folderPath)
    return Promise.all(files.map(async file => {
      let filePath = path.join(folderPath, file)
      let stat = fs.lstatSync(filePath)
      if(stat.isSymbolicLink()){
        let realPath = fs.readlinkSync(filePath)
        if(stat.isFile() && file.endsWith('.js')) {
          await this.cb(realPath, this)
        }else if(stat.isDirectory()){
          await this.iterateFolder(realPath)
        }
      }else if(stat.isFile() && file.endsWith('.js')){
        await this.cb(filePath, this)
      }else if(stat.isDirectory()){
        await this.iterateFolder(filePath)
      }
    }))
  }

  iterate(){
    return this.iterateFolder(this.path)
  }
}