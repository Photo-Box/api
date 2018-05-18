const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.pathVer = 1
router.perm = 'image.gen.light.art'
router.code = 'art'

router.schema = Joi.object().keys({
  picture: Joi.string().uri()
})

Util.genericTemplatePost(router)

router.imageprocess = class art extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let avatar = await Jimp.read(picture)
    avatar.resize(370, 370)

    let foreground = await Jimp.read(path.join(Constants.assetPath, 'art.png'))
    let img = new Jimp(1364, 1534)
    img.composite(avatar, 903, 92).composite(avatar, 903, 860).composite(foreground, 0, 0)

    this.sendJimp(msg, img)
  }
}

module.exports = router;