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
  },
  genericTemplatePost(router, contentype = 'image/png') {
    router.post('/', async (req, res, next) => {
      let token = await req.db.valid(req.get('Authorization'))
      if(!token) return res.status(401).send(Constants.StatusBody.BadAuth)
      if(!req.db.hasPerm(router.perm, token)) return res.status(401).send(Constants.StatusBody.BadPerms(router.perm, req.config.prefix))
      if(req.config.testing) console.log('>> processing request by', token.name, '|', req.method, req.originalUrl)
      try {
        await router.schema.validate(req.body)
        let body = req.body
        body.code = router.code
        let buffer = await req.ipm.sendMessage(body)
        res.status(200).set('Content-Type', contentype).send(buffer)
      } catch (e) {
        Util.processRequestErr(e, req, res)
      }
    })
  }
}

module.exports = Util