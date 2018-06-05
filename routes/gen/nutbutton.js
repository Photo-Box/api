const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.pathVer = 1
router.perm = 'image.gen.light.nutbutton'
router.code = 'nutbutton'

router.schema = Joi.object().keys({
  text: Joi.string()
})

Util.genericTemplatePost(router)

router.imageprocess = class nutbutton extends ImageCode {
  async process(msg) {
    let text = await Jimp.read(await this.createCaption({
      text: msg.text.toUpperCase(),
      font: 'impact.ttf',
      size: '170x155',
      gravity: 'Center',
      fill: '#ffffff'
    }))
    let t2 = new Jimp(327, 221)
    t2.composite(text, 78, 30)
    let t3 = await this.jimpToIM(t2)
    t3.out('-matte').out('-virtual-pixel').out('transparent').out('-distort').out('Perspective');
    t3.out("28,0,42,7 298,0,254,15 28,215,0,221 298,215,327,188");
    let t4 = await this.imToJimp(t3)
    let img = await Jimp.read(path.join(Constants.assetPath, 'nutbutton.png'))
    img.composite(t4, 1, 200)

    this.sendJimp(msg, img)
  }
}

module.exports = router;