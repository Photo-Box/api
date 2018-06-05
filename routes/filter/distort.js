const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')

router.pathVer = 1
router.perm = 'image.gen.heavy.distort'
router.code = 'distort'
router.schema = Joi.object().keys({
  picture: Joi.string().uri(),
  saturate: Joi.boolean().optional(),
  saturateAmount: Joi.number().integer().min(0).max(80).optional(),
  spin: Joi.number().integer().min(0).max(359).optional(),
  implode: Joi.number().integer().min(0).max(10).optional(),
  roll: Joi.boolean().optional(),
  swirl: Joi.number().integer().min(-180).max(180).optional()
})

Util.genericTemplatePost(router)

router.imageprocess = class distort extends ImageCode {
  async process(msg) {
    let img1 = await Jimp.read(msg.picture)
    const filters = [
      { apply: (msg.saturate !== undefined ? msg.saturate : this.rBool()) ? 'desaturate' : 'saturate', params: [msg.saturateAmount || this.rInt(40, 80)] },
      { apply: 'spin', params: [msg.spin || this.rInt(10, 350)] }
    ]
    img1.color(filters)
    let img2 = await this.jimpToIM(img1)
    let horizRoll = this.rInt(0, img1.bitmap.width),
        vertiRoll = this.rInt(0, img1.bitmap.height)
    if(msg.implode !== undefined && msg.implode !== 0) img2.out('-implode').out(`-${this.rInt(3, 10)}`)
    if(msg.implode === undefined) {
      img2.out('-implode').out(`-${this.rInt(3, 10)}`)
    } else if(msg.implode) {
      img2.out('-implode').out(`-${msg.implode}`)
    }
    if(msg.roll === undefined || msg.roll) img2.out('-roll').out(`+${horizRoll}+${vertiRoll}`)
    if(msg.swirl === undefined) {
      img2.out('-swirl').out(`${this.rBool() ? '+' : '-'}${this.rInt(120, 180)}`)
    } else if(msg.swirl) {
      img2.out('-swirl').out(`${(msg.swirl < 0) ? '+' : '-'}${msg.swirl}`)
    }

    this.sendIM(msg, img2)
  }
}

module.exports = router;