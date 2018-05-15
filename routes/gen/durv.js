const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.perm = 'image.gen.light.durv'
router.code = 'durv'

router.schema = Joi.object().keys({
  picture: Joi.string().uri()
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

router.imageprocess = class durv extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let avatar = await Jimp.read(picture)
    avatar.cover(157, 226)

    let foreground = await Jimp.read(path.join(Constants.assetPath, 'durv.png'))
    let canvas = new Jimp(401, 226)
    canvas.composite(avatar, 4, 0).composite(foreground, 0, 0)

    this.sendJimp(msg, canvas)
  }
}

module.exports = router;