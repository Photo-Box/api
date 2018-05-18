const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.animeprotest'
router.code = 'animeprotest'

router.schema = Joi.object().keys({
  text: Joi.string().max(100)
})

Util.genericTemplatePost(router)

router.imageprocess = class animeprotest extends ImageCode {
  async process(msg) {
    let body = im(await this.createCaption({
      text: msg.text,
      font: 'sunshine.ttf',
      size: '116x92',
      fill: '#62499c'
    }))
    body.command('convert');
    body.out('-matte').out('-virtual-pixel').out('transparent').out('-distort').out('Perspective');
    body.out("0,0,7,1 116,0,115,4 0,92,2,84 116,92,109,90");
    let bodytext = await this.imToJimp(body)
    let foreground = await Jimp.read(path.join(Constants.assetPath, 'animeprotest.png'))
    let img = new Jimp(219, 300, 0xf9f7f8ff)
    img.composite(bodytext, 60, 5).composite(foreground, 0, 0)

    this.sendJimp(msg, img)
  }
}

module.exports = router;