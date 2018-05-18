const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.pathVer = 1
router.perm = 'image.gen.medium.wanted'
router.code = 'wanted'

router.schema = Joi.object().keys({
  picture: Joi.string().uri(),
  name: Joi.string().max(30)
})

Util.genericTemplatePost(router)

router.imageprocess = class wanted extends ImageCode {
  async process(msg) {
    let body = await Jimp.read(await this.createCaption({
      text: msg.name.toUpperCase(),
      font: 'edmunds.ttf',
      size: '517x54',
      gravity: 'North'
    }))
    let bg = await Jimp.read(path.join(Constants.assetPath, 'wanted.png'))
    let overlay = await Jimp.read(path.join(Constants.assetPath, 'wanted_overlay.png'))
    let avatar = (await Jimp.read(await Util.requestResource(msg.picture))).contain(545, 536).sepia().color([
      { apply: 'mix', params: [ '#d09245', 60 ] }
    ])
    bg.composite(avatar, 166, 422).composite(overlay, 0, 0).composite(body, 184, 962)

    this.sendJimp(msg, bg)
  }
}

module.exports = router;