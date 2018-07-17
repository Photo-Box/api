const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')

router.pathVer = 1
router.perm = 'image.filter.heavy.distort'
router.code = 'distort'
router.schema = Joi.object().keys({
  picture: Joi.string().uri(),
  saturate: Joi.boolean().optional(),
  saturateAmount: Joi.number().integer().min(0).max(80).optional(),
  spin: Joi.number().integer().min(0).max(359).optional(),
  implode: Joi.number().integer().min(0).max(10).optional(),
  roll: Joi.boolean().optional(),
  horizontalRoll: Joi.number().integer().min(-180).max(180).optional(),
  verticalRoll: Joi.number().integer().min(-180).max(180).optional(),
  swirl: Joi.number().integer().min(-180).max(180).optional()
})

Util.genericTemplatePost(router)

router.imageprocess = class distort extends ImageCode {
  async process(msg) {
    let img1 = await Jimp.read(msg.picture)
    let special = Object.keys(msg).length !== 3
    let filters = special ? [] : [
      { apply: this.rBool() ? 'desaturate' : 'saturate', params: [this.rInt(40, 80)] },
      { apply: 'spin', params: [this.rInt(10, 350)] }
    ]
    if(special) {
      if(msg.saturate !== undefined) filters.push({
        apply: msg.saturate ? 'saturate' : 'desaturate',
        params: [msg.saturateAmount || this.rInt(40, 80)]
      })
      if(msg.spin !== undefined) filters.push({ apply: 'spin', params: [msg.spin] })
    }
    img1.color(filters)
    let img2 = await this.jimpToIM(img1)
    let horizRoll = this.rInt(0, img1.bitmap.width),
        vertiRoll = this.rInt(0, img1.bitmap.height)
    if(!special) {
      img2.out('-implode').out(`-${this.rInt(3, 10)}`)
      img2.out('-roll').out(`+${horizRoll}+${vertiRoll}`)
      img2.out('-swirl').out(`${this.rBool() ? '+' : '-'}${this.rInt(120, 180)}`)
    } else {
      if(msg.implode !== undefined) img2.out('-implode').out(`-${msg.implode}`)
      if(msg.swirl !== undefined) img2.out('-swirl').out(`${(msg.swirl < 0) ? '+' : '-'}${msg.swirl}`)
      if(msg.roll) img2.out('-roll').out(`+${msg.horizontalRoll || 0}+${msg.verticalRoll || 0}`)
    }
    console.log(msg, special, filters)

    this.sendIM(msg, img2)
  }
}

module.exports = router;