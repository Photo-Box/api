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
  }
}

module.exports = Util