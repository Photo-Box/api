const router = require('express').Router()

router.get('/', async (req, res, next) => {
  const auth = req.get('Authorization')
  if(!(await req.db.ticketValid('photobox', auth))) return res.status(401).send({ code: 401, message: 'Invalid/Expired Ticket' })
  let ticket = await req.db.getTicket(auth)
  let token = await req.db.getAuth(ticket.user)
  if(!token) return res.status(404).send({ status: 404, message: 'user does not have token' })
  if(req.query.regen === 'true') {
    const newtoken = req.tokengen.generate()
    req.db.replaceToken(ticket.user, newtoken)
    res.status(200).send({ token: newtoken, name: token.name, permissions: token.permissions, regen: true })
  } else {
    res.status(200).send({ token: token.token, name: token.name, permissions: token.permissions, regen: false })
  }
})

module.exports = router;