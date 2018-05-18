const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.pathVer = 1
router.perm = 'image.gen.light.durv'
router.code = 'durv'

router.schema = Joi.object().keys({
  picture: Joi.string().uri()
})

Util.genericTemplatePost(router)

router.imageprocess = class durv extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let avatar = await Jimp.read(picture)
    avatar.cover(157, 226)

    let foreground = await Jimp.read(path.join(Constants.assetPath, 'durv.png'))
    let canvas = new Jimp(401, 226)
    canvas.composite(avatar, 4, 0).composite(foreground, 0, 0)

    this.sendJimp(msg, canvas)
  }
}

module.exports = router;