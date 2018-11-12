const sqlite3 = require('sqlite3')
const debug = require('debug')('nodeefrei:db')
sqlite3.verbose()

class Database {
  constructor () {
    debug('Init database')
    this.db = new sqlite3.Database('./data/db.sqlite3')
    this.db.serialize(() => {
      this.db.run('CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL PRIMARY KEY, password TEXT NOT NULL, token VARCHAR(20))')
      this.db.run('CREATE TABLE IF NOT EXISTS channels (channel TEXT NOT NULL PRIMARY KEY, admin TEXT NOT NULL,' +
        'FOREIGN KEY(admin) REFERENCES users(username))')
      this.db.run('CREATE TABLE IF NOT EXISTS messages (user TEXT NOT NULL, channel TEXT NOT NULL, content TEXT NOT NULL,' +
        'FOREIGN KEY(user) REFERENCES users(username),' +
        'FOREIGN KEY(channel) REFERENCES channels(channel))')
      this.db.run('CREATE TABLE IF NOT EXISTS private_messages (from_user TEXT NOT NULL, to_user TEXT NOT NULL, content TEXT NOT NULL,' +
        'FOREIGN KEY(from_user) REFERENCES users(username),' +
        'FOREIGN KEY(to_user) REFERENCES users(username))')
    })
  }

  all (query, params) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, row) => {
        if (err) {
          reject(err)
        }
        resolve(row)
      })
    })
  }

  run (query, params) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err, row) => {
        if (err) {
          reject(err)
        }
        resolve(row)
      })
    })
  }

  get (query, params) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err)
        }
        resolve(row)
      })
    })
  }

  async getChannels () {
    return this.all('SELECT * FROM channels')
  }

  async createChannel (name, admin) {
    return this.run('INSERT INTO channels (channel, admin) VALUES (?, ?)', [name, admin])
  }

  async createUser (name, password) {
    return this.run('INSERT INTO users (username, password) VALUES (?, ?)', [name, password])
  }

  async setTokenForUser (name, token) {
    return this.run('UPDATE users SET token = ? WHERE username = ?', [token, name])
  }

  async getUser (name) {
    return this.get('SELECT * FROM users WHERE username = ?', [name])
  }

  async getChannel (name) {
    return this.get('SELECT * FROM channels WHERE channel = ?', [name])
  }

  async getUserByToken (token) {
    return this.get('SELECT * FROM users WHERE token = ?', [token])
  }

  async createMessage (user, channel, content) {
    return this.run('INSERT INTO messages VALUES (?,?,?)', [user, channel, content])
  }

  async getMessagesForChannel (channel) {
    return this.all('SELECT * FROM messages WHERE channel = ?', [channel])
  }

  async getPmForUser (user) {
    return this.all('SELECT * FROM private_messages WHERE to_user = ?', [user])
  }

  async getPmFromAndToUser (fromUser, toUser) {
    return this.all('SELECT * FROM private_messages WHERE (to_user = ? AND from_user = ?) OR (to_user = ? AND from_user = ?)', [toUser, fromUser, fromUser, toUser])
  }

  async createPm (fromUser, toUser, content) {
    return this.run('INSERT INTO private_messages VALUES (?,?,?)', [fromUser, toUser, content])
  }
}

module.exports = new Database()
