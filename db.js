const sqlite3 = require('sqlite3')
const debug = require('debug')('nodeefrei:db')
sqlite3.verbose()

let database = {
  init: () => {
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
  },
  getChannels: (callback) => {
    this.db.all('SELECT * FROM channels', callback)
  },
  createChannel: (name, admin) => {
    this.db.run('INSERT INTO channels VALUES (?, ?)', [name, admin])
  },
  createUser: (name, password) => {
    this.db.run('INSERT INTO users (username, password) VALUES (?, ?)', [name, password])
  },
  setTokenForUser: (name, token) => {
    this.db.run('UPDATE users SET token = ? WHERE username = ?', [token, name])
  },
  getUser: (name, callback) => {
    this.db.get('SELECT * FROM users WHERE username = ?', [name], callback)
  },
  getChannel: (name, callback) => {
    this.db.get('SELECT * FROM channels WHERE channel = ?', [name], callback)
  },
  getUserByToken: (token, callback) => {
    this.db.get('SELECT * FROM users WHERE token = ?', [token], callback)
  },
  createMessage: (user, channel, content) => {
    this.db.run('INSERT INTO messages VALUES (?,?,?)', [user, channel, content])
  },
  getMessagesForChannel: (channel, callback) => {
    this.db.all('SELECT * FROM messages WHERE channel = ?', [channel], callback)
  },
  getPmForUser: (user, callback) => {
    this.db.all('SELECT * FROM private_messages WHERE to_user = ?', [user], callback)
  },
  getPmFromAndToUser: (fromUser, toUser, callback) => {
    this.db.all('SELECT * FROM private_messages WHERE (to_user = ? AND from_user = ?) OR (to_user = ? AND from_user = ?)', [toUser, fromUser, fromUser, toUser], callback)
  },
  createPm: (fromUser, toUser, content, callback) => {
    this.db.run('INSERT INTO private_messages VALUES (?,?,?)', [fromUser, toUser, content], callback)
  }
}

module.exports = database