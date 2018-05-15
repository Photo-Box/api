const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.perm = 'image.gen.light.changemymind'
router.code = 'changemymind'

router.schema = Joi.object().keys({
  text: Joi.string().max(100)
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

router.imageprocess = class changemymind extends ImageCode {
  async process(msg) {
    let body = im(await this.createCaption({
      text: msg.text.toUpperCase(),
      font: 'impact.ttf',
      size: '266x168',
      gravity: 'North'
    }))
    body.command('convert');
    body.out('-matte').out('-virtual-pixel').out('transparent').out('-distort').out('Perspective');
    body.out("0,0,0,102 266,0,246,0 0,168,30,168 266,168,266,68");
    let bodytext = await this.imToJimp(body)
    let bg = await Jimp.read(path.join(Constants.assetPath, 'changemymind.png'))
    bg.composite(bodytext, 364, 203)
    this.sendJimp(msg, bg)
  }
}

module.exports = router;