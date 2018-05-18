const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.ttt'
router.code = 'ttt'

router.schema = Joi.object().keys({
  title: Joi.string().max(30),
  avatar: Joi.string().uri(),
  text: Joi.string().max(150)
})

Util.genericTemplatePost(router)

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