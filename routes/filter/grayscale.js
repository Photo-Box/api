const router = require('express').Router()
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')

router.pathVer = 1
router.perm = 'image.gen.light.grayscale'
router.code = 'grayscale'

Util.genericFilterPost(router)

router.imageprocess = class grayscale extends ImageCode {
  async process(msg) {
    let img = await Jimp.read(msg.picture)
    img.grayscale()

    this.sendJimp(msg, img)
  }
}

module.exports = router;