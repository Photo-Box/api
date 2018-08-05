const router = require('express').Router()
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')

router.pathVer = 1
router.perm = 'image.filter.light.grayscale'
router.code = 'grayscale'

Util.genericFilterPost(router)

router.imageprocess = class grayscale extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let img = await Jimp.read(picture)
    img.grayscale()

    this.sendJimp(msg, img)
  }
}

module.exports = router;