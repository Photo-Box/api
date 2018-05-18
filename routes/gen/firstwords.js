const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.firstwords'
router.code = 'firstwords'

router.schema = Joi.object().keys({
  text: Joi.string().max(100)
})

Util.genericTemplatePost(router)

router.imageprocess = class firstwords extends ImageCode {
  async process(msg) {
    let top = im(440, 77).command('convert')
    top.font(path.join(__dirname, '..', 'assets', 'fonts', 'comic.ttf'), 55)
    top.out('-fill').out('#000000')
    top.out('-background').out('transparent')
    top.out('-gravity').out('center')
    top.out(`caption:${msg.text[0]}.. ${msg.text[0]}..`)

    let bodytext = await Jimp.read(await this.createCaption({
      text: msg.text,
      font: 'comic.ttf',
      size: '650x200',
      gravity: 'Southwest'
    }))
    let toptext = await this.imToJimp(top)
    let canvas = await Jimp.read(path.join(Constants.assetPath, 'firstwords.png'))
    canvas.composite(bodytext, 30, 570).composite(toptext, 30, 38)

    this.sendJimp(msg, canvas)
  }
}

module.exports = router;