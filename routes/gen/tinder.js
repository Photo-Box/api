const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.pathVer = 1
router.perm = 'image.gen.fast.tinder'
router.code = 'tinder'

router.schema = Joi.object().keys({
  pictureOne: Joi.string().uri(),
  pictureTwo: Joi.string().uri()
})

Util.genericTemplatePost(router)

router.imageprocess = class tinder extends ImageCode {
  async process(msg) {
    let avatar = await Jimp.read(await Util.requestResource(msg.pictureOne))
    let avatar2 = await Jimp.read(await Util.requestResource(msg.pictureTwo))
    avatar.resize(218, 218)
    avatar2.resize(218, 218)
    let foreground = await Jimp.read(path.join(Constants.assetPath, 'tinder.png'))
    let img = new Jimp(570, 738, 0xffffffff)
    img.composite(avatar, 53, 288).composite(avatar2, 309, 288).composite(foreground, 0, 0)

    this.sendJimp(msg, img)
  }
}

module.exports = router;