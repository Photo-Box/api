const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })

router.pathVer = 1
router.perm = 'image.gen.light.okbyemom'
router.code = 'okbyemom'

router.schema = Joi.object().keys({
  picture: Joi.string().uri()
})

Util.genericTemplatePost(router)

router.imageprocess = class okbyemom extends ImageCode {
  async process(msg) {
    let txt = im(290, 31).command('convert')
    txt.out('-fill').out('#000000')
    txt.out('-background').out('transparent')
    txt.out('-gravity').out('west')
    txt.out(`caption:${msg.text}`)
    let t2 = new Jimp(290, 142)
    let t3 = await this.imToJimp(txt)
    t2.composite(t3, 0, 0)
    let t4 = await this.jimpToIM(t2)
    t4.out('-matte').out('-virtual-pixel').out('transparent').out('-distort').out('Perspective');
    t4.out("0,0,6,113 290,0,275,0 0,31,18,141 290,31,288,29");
    let t5 = await this.imToJimp(t4)
    let img = await Jimp.read(path.join(Constants.assetPath, 'okbyemom.png'))
    img.composite(t5, 314, 435)

    this.sendJimp(msg, img)
  }
}

module.exports = router;