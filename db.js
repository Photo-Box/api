const rdb = require("rethinkdb")

module.exports = class Database {
  async connect({host = 'localhost', port, user, password, database}) {
    let err, conn = await rdb.connect({host, port, user, password})
    if(err) return this.onError(err)
    console.log('[DB]', 'Connected')
    if(database) conn.use(database)
    conn.on('close', this.onClose.bind(this));
    conn.on('timeout', this.onTimeout.bind(this));
    this.conn = conn
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.database = database
  }

  get r() {
    return rdb
  }

  async ticketValid(profile, ticket) {
    try{
      let data = await rdb.db('Turquoise').table('tickets').get(ticket).run(this.conn)
      if(data.profile !== profile) return false
      if(data.expire < Date.now()) {
        await rdb.db('Turquoise').table('tickets').get(ticket).delete().run(this.conn)
        return false
      }
      return true
    } catch (e) {
      return false
    }
  }

  getTicket(ticket) {
    return rdb.db('Turquoise').table('tickets').get(ticket).run(this.conn)
  }

  addToken(token) {
    rdb.table('apitokens').insert(token).run(this.conn)
  }

  async valid(token) {
    try{
      let data = await (await rdb.table('apitokens').filter({ token }).run(this.conn)).toArray()
      return data[0]
    } catch (e) {
      return false
    }
  }

  hasPerm(perm, token) {
    let okay = false
    token.permissions.map(p => {
      if(this.prefix) p = this.prefix + '.' + p
      if(p === perm) return okay = true
      if(perm.startsWith(p) && ['.', undefined].includes(perm.slice(p.length)[0])) return okay = true
    })
    return okay
  }

  getAuth(id) {
    return rdb.table('apitokens').get(id).run(this.conn)
  }

  replaceToken(id, token) {
    return rdb.table('apitokens').get(id).update({ token }).run(this.conn)
  }

  async reconnect() {
    this.conn = await this.conn.reconnect({noreplyWait: false})
    conn.on('close', this.onClose.bind(this));
    conn.on('timeout', this.onTimeout.bind(this));
  }

  onError(err) {
    console.log('[DB]', 'Error', err)
  }

  async onClose() {
    console.log('[DB]', 'Closed')
    await this.reconnect()
  }

  async onTimeout() {
    console.log('[DB]', 'Connection Timeout')
    await this.reconnect()
  }
}