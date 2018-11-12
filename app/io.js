const db = require('./db')

const initIO = (server) => {
  const io = require('socket.io')(server)
  let online = {}
  io.on('connection', function (socket) {
    socket.on('login', async (msg) => {
      const user = await db.getUserByToken(msg)
      socket.emit('user info', user)
      socket.emit('online', online)
      online[socket.id] = user.username
      io.emit('user-login', {
        user: user.username
      })
    })
    socket.on('disconnect', function () {
      io.emit('user-logout', {
        user: online[socket.id]
      })
      online[socket.id] = undefined
    })
    socket.on('channels-request', async () => {
      socket.emit('channels', await db.getChannels())
    })
    socket.on('channel-messages-request', async (msg) => {
      const msgs = await db.getMessagesForChannel(msg.channel)
      for (let message of msgs) {
        socket.emit('channel-message', {
          channel: message.channel,
          content: message.content,
          user: message.user
        })
      }
    })
    socket.on('channel-message', async (msg) => {
      const user = await db.getUserByToken(msg.token)
      const channel = await db.getChannel(msg.channel)
      if (channel) {
        await db.createMessage(user.username, channel.channel, msg.content)
        io.emit('channel-message', {
          channel: channel.channel,
          content: msg.content,
          user: user.username,
          admin: channel.admin
        })
      }
    })
    socket.on('pm-request', async (msg) => {
      const user = await db.getUserByToken(msg.token)
      if (msg.user !== undefined) {
        const msgs = await db.getPmFromAndToUser(msg.user, user.username)
        socket.emit('private-messages', msgs)
      } else {
        socket.emit('private-messages', await db.getPmForUser(user.username))
      }
    })
    socket.on('pm-message', async (msg) => {
      const from = await db.getUserByToken(msg.token)
      const to = await db.getUser(msg.user)
      await db.createPm(from.username, to.username, msg.content)
      socket.emit('private-messages', await db.getPmFromAndToUser(from.username, to.username))
    })
  })
}

module.exports = initIO
