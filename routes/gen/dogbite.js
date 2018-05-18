const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.pathVer = 1
router.perm = 'image.gen.light.dogbite'
router.code = 'dogbite'

router.schema = Joi.object().keys({
  text: Joi.string().max(30)
})

Util.genericTemplatePost(router)

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