const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.clint'
router.code = 'clint'

router.schema = Joi.object().keys({
  picture: Joi.string().uri()
})

Util.genericTemplatePost(router)

router.imageprocess = class clint extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let avatar = await Jimp.read(picture)
    avatar.resize(700, 700)

    let bgImg = await this.jimpToIM(avatar)
    bgImg.command('convert')
    bgImg.out('-matte').out('-virtual-pixel').out('transparent')
    bgImg.out('-distort').out('Perspective')
    bgImg.out("0,0,0,132  700,0,330,0  0,700,0,530  700,700,330,700")

    let jBgImg = await this.imToJimp(bgImg)
    let foreground = await Jimp.read(path.join(Constants.assetPath, 'clint.png'))

    let img = new Jimp(1200, 675)
    img.composite(jBgImg, 782, 0).composite(foreground, 0, 0)

    this.sendJimp(msg, img)
  }
}

module.exports = router;