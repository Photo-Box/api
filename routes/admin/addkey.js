const router = require('express').Router()

router.post('/', async (req, res, next) => {
  let token = await req.db.valid(req.get('Authorization'))
  if(req.get('Authorization') !== req.config.masterkey) return res.status(401).send(req.constants.StatusBody.BadAuth)
  if(!req.body.permissions) return res.status(400).send(req.constants.StatusBody.BadBody('Must have "permissions" property.'))
  if(!req.body.id) return res.status(400).send(req.constants.StatusBody.BadBody('Must hav "id" property.'))
  let tokendata = req.body
  tokendata.token = req.tokengen.generate()
  await req.db.addToken(tokendata)
  res.status(200).send({ token: tokendata })
})

module.exports = router;