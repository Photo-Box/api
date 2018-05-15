const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.perm = 'image.gen.light.ttt'
router.code = 'ttt'

router.schema = Joi.object().keys({
  title: Joi.string().max(30),
  avatar: Joi.string().uri(),
  text: Joi.string().max(150)
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

router.imageprocess = class ttt extends ImageCode {
  async process(msg) {
    let title = im(305, 13).command('convert').antialias(false)
    title.font(path.join(__dirname, '..', 'assets', 'fonts', 'tahoma.ttf'), 11)
    title.out('-fill').out('#dddddd')
    title.out('-background').out('transparent')
    title.out('-gravity').out('west')
    title.out(`caption:Body Search Results - ${msg.title}`)

    let img = im(279, 63).command('convert').antialias(false)
    img.font(path.join(__dirname, '..', 'assets', 'fonts', 'tahoma.ttf'), 11)
    img.out('-fill').out('#dddddd')
    img.out('-background').out('transparent')
    img.out('-gravity').out('northwest')
    img.out(`caption:Something tells you some of this person's last words were: '${msg.text}--.'`)

    let avatar = await Jimp.read(await Util.requestResource(msg.avatar))
    let toptxt = await this.imToJimp(title)
    let body = await this.imToJimp(img)
    let wind = await Jimp.read(path.join(Constants.assetPath, 'ttt.png'))
    avatar.resize(32, 32)
    wind.composite(avatar, 32, 56).composite(toptxt, 12, 10).composite(body, 108, 130)

    this.sendJimp(msg, wind)
  }
}

module.exports = router;