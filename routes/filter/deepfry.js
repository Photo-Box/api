const router = require('express').Router()
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')
const embossMatrix = [
  [2, -1, 0],
  [-1, 1, 1],
  [0, 1, 2]
]

router.pathVer = 1
router.perm = 'image.filter.heavy.deepfry'
router.code = 'deepfry'

Util.genericFilterPost(router)

router.imageprocess = class deepfry extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let img = await Jimp.read(picture)
    let width = img.bitmap.width
    let height = img.bitmap.height
    img.scale(.75, Jimp.RESIZE_HERMITE)
    img.resize(width * .88, height * .88, Jimp.RESIZE_BILINEAR)
    img.resize(width * .9, height * .9, Jimp.RESIZE_BICUBIC)
    img.resize(width, height, Jimp.RESIZE_BICUBIC)
    img.posterize(4).brightness(.1).contrast(1)
    img.color([
      { apply: 'mix', params: [ '#f00', .75 ] },
      { apply: 'mix', params: [ '#ff0', .75 ] }
    ])
    img.convolute(embossMatrix)

    this.sendJimp(msg, img)
  }
}

module.exports = router;