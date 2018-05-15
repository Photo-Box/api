const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.perm = 'image.gen.medium.wanted'
router.code = 'wanted'

router.schema = Joi.object().keys({
  picture: Joi.string().uri(),
  name: Joi.string()
})

router.post('/', async (req, res, next) => {
  let token = await req.db.valid(req.get('Authorization'))
  if(!req.db.hasPerm(router.perm, token)) return res.status(401).send(Constants.StatusBody.BadPerms(router.perm))
  try {
    await router.schema.validate(req.body)
    let body = req.body
    body.code = router.code
    let buffer = await req.processes[token.ip || 'main'].sendMessage(body)
    res.status(200).set('Content-Type', 'image/png').send(buffer)
  } catch (e) {
    console.log(e)
    if(e.name === 'ValidationError') return res.status(400).send(Constants.StatusBody.InvalidSchema(e.toString()))
    if(e.statusText) return res.status(400).send(Constants.StatusBody.ResourceError(e.message))
    if(e.msg.special && e.msg.special._type === 1) return res.status(400).send(Constants.StatusBody.ResourceError(e.msg.special))
    if(e.msg.special && e.msg.special._type === 2) return res.status(400).send(Constants.StatusBody.InvalidFileType(e.msg.special))
    res.status(500).send(Constants.StatusBody.ImageProcessError(e.message))
  }
})

router.imageprocess = class wanted extends ImageCode {
  async process(msg) {
    let body = await Jimp.read(await this.createCaption({
      text: msg.name.toUpperCase(),
      font: 'edmunds.ttf',
      size: '517x54',
      gravity: 'North'
    }))
    let bg = await Jimp.read(path.join(Constants.assetPath, 'wanted.png'))
    let overlay = await Jimp.read(path.join(Constants.assetPath, 'wanted_overlay.png'))
    let avatar = (await Jimp.read(await Util.requestResource(msg.picture))).contain(545, 536).sepia().color([
      { apply: 'mix', params: [ '#d09245', 60 ] }
    ])
    bg.composite(avatar, 166, 422).composite(overlay, 0, 0).composite(body, 184, 962)

    this.sendJimp(msg, bg)
  }
}

module.exports = router;