const snekfetch = require('snekfetch')
const Constants = require('./Constants')

const Util = {
  async requestResource(url) {
    try{
      let response = await snekfetch.get(url)
      if(!Constants.AllowedFileTypes.includes(response.headers['content-type'])) {
        let e = new Error(`Bad file type ${response.headers['content-type']}`)
        e.special = {
          _type: 2,
          url,
          fileType: response.headers['content-type'],
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        }
        throw e
      }
      return response.body
    }catch(e){
      if(e.statusText) e.special = {
        _type: 1,
        url,
        status: e.status,
        statusText: e.statusText,
        headers: e.headers
      }
      throw e
    }
  },
  processRequestErr(e, req, res){
    if(e.name === 'ValidationError') return res.status(400).send(Constants.StatusBody.InvalidSchema(e.toString()))
    if(e.statusText) return res.status(400).send(Constants.StatusBody.ResourceError(e.message))
    if(e.msg.special && e.msg.special._type === 1) return res.status(400).send(Constants.StatusBody.ResourceError(e.msg.special))
    if(e.msg.special && e.msg.special._type === 2) return res.status(400).send(Constants.StatusBody.InvalidFileType(e.msg.special))
    res.status(500).send(Constants.StatusBody.ImageProcessError(e.message))
  }
}

module.exports = Util