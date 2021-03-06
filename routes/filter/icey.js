const router = require('express').Router()
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')
const colorThief = require('color-thief-jimp')

router.pathVer = 1
router.perm = 'image.filter.light.icey'
router.code = 'icey'

Util.genericFilterPost(router)

router.imageprocess = class icey extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let img = await Jimp.read(picture)
    let avg = colorThief.getColor(img).reduce((p, c) => p + c) / 3;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
      var red = img.bitmap.data[idx];
      var green = img.bitmap.data[idx+1];
      var blue = img.bitmap.data[idx+2];

      red = (red * 0.4471) * (200/avg);
      green = (green * 0.5373) * (550/avg);
      blue = (blue * 0.8549) * (500/avg);
      img.bitmap.data[idx] = (red < 255) ? red : 255;
      img.bitmap.data[idx+1] = (green < 255) ? green : 255;
      img.bitmap.data[idx+2] = (blue < 255) ? blue : 255;
    })

    this.sendJimp(msg, img)
  }
}

module.exports = router;