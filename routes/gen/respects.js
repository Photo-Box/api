const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.respects'
router.code = 'respects'

router.schema = Joi.object().keys({
  picture: Joi.string().uri()
})

Util.genericTemplatePost(router)

router.imageprocess = class respects extends ImageCode {
  async process(msg) {
    let avatar = await Jimp.read(await Util.requestResource(msg.picture))
    avatar.resize(110, 110)

    let bgImg = await this.jimpToIM(avatar)
    bgImg.command('convert')
    bgImg.out('-matte').out('-virtual-pixel').out('transparent')
    bgImg.out('-distort').out('Perspective')
    bgImg.out("110,0,66,0 0,110,13,104 110,110,73,100, 0,0,0,0")

    let jBgImg = await this.imToJimp(bgImg)
    let foreground = await Jimp.read(path.join(Constants.assetPath, 'respects.png'))
    let img = new Jimp(950, 540, 0xffffffff);
    img.composite(jBgImg, 366, 91).composite(foreground, 0, 0)

    this.sendJimp(msg, img)
  }
}

module.exports = router;