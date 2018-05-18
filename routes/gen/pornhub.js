const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')

router.pathVer = 1
router.perm = 'image.gen.light.pornhub'
router.code = 'pornhub'

router.schema = Joi.object().keys({
  picture: Joi.string().uri(),
  title: Joi.string().max(130)
})

Util.genericTemplatePost(router)

router.imageprocess = class pornhub extends ImageCode {
  async process(msg) {
    let picture = await Util.requestResource(msg.picture)
    let thumbnail = await Jimp.read(picture)
    thumbnail.contain(773, 437)

    let title = await Jimp.read(await this.createCaption({
      text: msg.title.toUpperCase(),
      font: 'arialbd.ttf',
      size: '731x32',
      gravity: 'NorthWest',
      fill: 'white',
      fontsize: 16
    }))

    let bg = await Jimp.read(path.join(Constants.assetPath, 'pornhub.png'))
    bg.composite(thumbnail, 15, 101).composite(title, 25, 552)

    this.sendJimp(msg, bg)
  }
}

module.exports = router;