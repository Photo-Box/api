const router = require('express').Router()

router.post('/', async (req, res, next) => {
  let token = await req.db.valid(req.get('Authorization'))
  if(req.get('Authorization') !== req.config.masterkey) return res.status(401).send(req.constants.StatusBody.BadAuth)
  res.status(200).send({})
  process.exit(0)
})

module.exports = router;