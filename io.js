const db = require('./db')
const debug = require('debug')('nodeefrei:server')

const initIO = (server) => {
  const io = require('socket.io')(server)
  let online = {}
  io.on('connection', function (socket) {
    socket.on('login', (msg) => {
      db.getUserByToken(msg, (err, row) => {
        socket.emit('user info', row)
        socket.emit('online', online)
        online[socket.id] = row.username
        io.emit('user-login', {
          user: row.username
        })
      })
    })
    socket.on('disconnect', function () {
      io.emit('user-logout', {
        user: online[socket.id]
      })
      online[socket.id] = undefined
    })
    socket.on('channels-request', () => {
      db.getChannels((err, rows) => {
        socket.emit('channels', rows)
      })
    })
    socket.on('channel-messages-request', (msg) => {
      db.getMessagesForChannel(msg.channel, (err, rows) => {
        if (err || !rows) {
          console.log(err)
          return
        }
        for (let message of rows) {
          socket.emit('channel-message', {
            channel: message.channel,
            content: message.content,
            user: message.user
          })
        }
      })
    })
    socket.on('channel-message', (msg) => {
      db.getUserByToken(msg.token, (err, user) => {
        if (err || !user) {
          return
        }
        db.getChannel(msg.channel, (err, row) => {
          if (err || !row) {
            debug('Can\'t create mesage')
            return
          }
          debug(`Creating new message ${msg.content} for user ${user.username} in channel ${row.channel}`)
          db.createMessage(user.username, row.channel, msg.content)
          io.emit('channel-message', {
            channel: row.channel,
            content: msg.content,
            user: user.username,
            admin: row.admin
          })
        })
      })
    })
  })
}

module.exports = initIO
