const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.perm = 'image.gen.light.dogbite'
router.code = 'dogbite'

router.schema = Joi.object().keys({
  text: Joi.string().max(30)
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
    Util.processRequestErr(e, req, res)
  }
})

router.imageprocess = class dogbite extends ImageCode {
  async process(msg) {
    let bodytext = await Jimp.read(await this.createCaption({
      text: msg.text,
      font: 'comic.ttf',
      size: '218x48',
      gravity: 'North'
    }))

    let canvas = await Jimp.read(path.join(Constants.assetPath, 'dogbite.png'))
    canvas.composite(bodytext, 19, 256)

    this.sendJimp(msg, canvas)
  }
}

module.exports = router;