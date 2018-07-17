const router = require('express').Router()
const { ImageCode, Util } = require('struct')
const Jimp = require('jimp')

router.pathVer = 1
router.perm = 'image.filter.heavy.magik'
router.code = 'magik'

Util.genericFilterPost(router)

router.imageprocess = class magik extends ImageCode {
  async process(msg) {
    let img = await Jimp.read(msg.picture)
    img.resize(Jimp.AUTO, 512)
    let avatar = this.jimpToIM(img)
    avatar.out('-liquid-rescale').out('180%')
    avatar.out('-liquid-rescale').out('60%')
    this.sendIM(msg, avatar)
  }
}

module.exports = router;