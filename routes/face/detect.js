const router = require('express').Router()
const Joi = require('joi')
const { ImageCode, Constants, Util } = require('struct')
const Jimp = require('jimp')
const path = require('path')
const im = require('gm').subClass({ imageMagick: true })
const _ = require('underscore')

router.pathVer = 1
router.perm = 'image.face.detect'

router.schema = Joi.object().keys({
  picture: Joi.string().uri()
})

router.post('/', async (req, res, next) => {
  let token = await req.db.valid(req.get('Authorization'))
  if(!token) return res.status(401).send(Constants.StatusBody.BadAuth)
  if(!req.db.hasPerm(router.perm, token)) return res.status(401).send(Constants.StatusBody.BadPerms(router.perm, req.config.prefix))
  if(req.config.testing) console.log('>> processing request by', token.name, '|', req.method, req.originalUrl)
  try {
    await router.schema.validate(req.body)
    let ic = new ImageCode()
    let [faces] = await ic.detectFaces(req.body.picture)
    let result = {
      faces: []
    }
    await Promise.all(_.map(faces, async face => {
      let f = {
        type: 'face',
        x: face.getX(),
        y: face.getY(),
        width: face.getWidth(),
        height: face.getHeight(),
        features: []
      }
      await Promise.all(_.map(face.getFeatures(), async (list, name) => {
        await Promise.all(_.map(list, feature => {
          let ff = {
            type: name,
            x: feature.getX(),
            y: feature.getY(),
            width: feature.getWidth(),
            height: feature.getHeight()
          }
          f.features.push(ff)
        }))
      }))
      result.faces.push(f)
    }))
    res.status(200).send(result)
  } catch (e) {
    Util.processRequestErr(e, req, res)
  }
})

module.exports = router;