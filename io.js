const db = require('./db')
const debug = require('debug')('nodeefrei:server')

const initIO = (server) => {
  const io = require('socket.io')(server)
  let online = {}
  io.on('connection', function (socket) {
    socket.on('login', (msg) => {
      db.getUserByToken(msg, (err, row) => {
        if (err || !row) {
          console.log(`User not found for token ${msg}`)
          return
        }
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
    socket.on('pm-request', (msg) => {
      db.getUserByToken(msg.token, (err, user) => {
        if (err || !user) {
          return
        }
        if (msg.user !== undefined) {
          db.getPmFromAndToUser(msg.user, user.username, (err, msgs) => {
            if (err || !user) {
              console.log(err)
              return
            }
            socket.emit('private-messages', msgs)
          })
        } else {
          db.getPmForUser(user.username, (err, msgs) => {
            if (err || !user) {
              return
            }
            socket.emit('private-messages', msgs)
          })
        }
      })
    })
    socket.on('pm-message', (msg) => {
      db.getUserByToken(msg.token, (err, from) => {
        if (err || !from) {
          return
        }
        db.getUser(msg.user, (err1, to) => {
          if (err1 || !from) {
            return
          }
          db.createPm(from.username, to.username, msg.content, () => {
            db.getPmFromAndToUser(from.username, to.username, (err, msg) => {
              socket.emit('private-messages', msg)
            })
          })
        })
      })
    })
  })
}

module.exports = initIO
