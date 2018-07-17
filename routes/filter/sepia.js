const router = require('express').Router()
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')

router.pathVer = 1
router.perm = 'image.filter.light.sepia'
router.code = 'sepia'

Util.genericFilterPost(router)

router.imageprocess = class sepia extends ImageCode {
  async process(msg) {
    let img = await Jimp.read(msg.picture)
    img.sepia()

    this.sendJimp(msg, img)
  }
}

module.exports = router;