const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.perm = 'image.gen.medium.starvstheforceof'
router.code = 'starvstheforceof'

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

router.imageprocess = class starvstheforceof extends ImageCode {
  async process(msg) {
    let avatar = await Jimp.read(await Util.requestResource(msg.avatar))
    avatar.resize(700, 700)

    let color = colorThief.getColor(avatar)
    let lowest = Math.min(color[0], color[1], color[2])
    color = color.map(a => Math.min(a - lowest, 32))

    let bgImg = await this.jimpToIM(avatar)
    bgImg.command('convert')
    bgImg.out('-matte').out('-virtual-pixel').out('transparent')
    bgImg.out('-extent').out('1468x1656').out('-distort').out('Perspective')
    bgImg.out("0,0,0,208  700,0,1468,0  0,700,0,1326  700,700,1468,1656")

    let jBgImg = await this.imToJimp(bgImg)
    jBgImg.resize(734, 828)
    let foreground = await Jimp.read(path.join(Constants.assetPath, 'starvstheforceof.png'))
    foreground.resize(960, 540)

    let actions = []
    if (color[0] > 0) actions.push({ apply: 'red', params: [color[0]] })
    if (color[1] > 0) actions.push({ apply: 'green', params: [color[1]] })
    if (color[2] > 0) actions.push({ apply: 'blue', params: [color[2]] })
    foreground.color(actions)
    let img = new Jimp(960, 540)
    jBgImg.crop(0, 104, 600, 540)
    img.composite(jBgImg, 430, 0).composite(foreground, 0, 0)

    this.sendJimp(msg, img)
  }
}

module.exports = router;