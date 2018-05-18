const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.respects'
router.code = 'respects'

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
    let buffer = await req.ipm.sendMessage(body)
    res.status(200).set('Content-Type', 'image/png').send(buffer)
  } catch (e) {
    Util.processRequestErr(e, req, res)
  }
})

router.imageprocess = class respects extends ImageCode {
  async process(msg) {
    let avatar = await Jimp.read(await Util.requestResource(msg.avatar))
    avatar.resize(110, 110)

    let bgImg = await this.jimpToIM(avatar)
    bgImg.command('convert')
    bgImg.out('-matte').out('-virtual-pixel').out('transparent')
    bgImg.out('-distort').out('Perspective')
    bgImg.out("110,0,66,0 0,110,13,104 110,110,73,100, 0,0,0,0")

    let jBgImg = await this.imToJimp(bgImg)
    let foreground = await Jimp.read(path.join(Constants.assetPath, 'respects.png'))
    let img = new Jimp(950, 540, 0xffffffff);
    img.composite(jBgImg, 366, 91).composite(foreground, 0, 0)

    this.sendJimp(msg, img)
  }
}

module.exports = router;