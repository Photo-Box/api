const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.changemymind'
router.code = 'changemymind'

router.schema = Joi.object().keys({
  text: Joi.string().max(100)
})

Util.genericTemplatePost(router)

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