const router = require('express').Router()
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')

router.pathVer = 1
router.perm = 'image.filter.light.sharpen'
router.code = 'sharpen'

Util.genericFilterPost(router)

router.imageprocess = class sharpen extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let img = await Jimp.read(picture)
    img.convolute([
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ])

    this.sendJimp(msg, img)
  }
}

module.exports = router;