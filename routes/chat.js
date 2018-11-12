const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const randstring = require('randomstring')
const db = require('../app/db')

router.get('/', (req, res, next) => {
  res.render('chat', {})
})

router.post('/login', async (req, res, next) => {
  console.log(req.body)
  const user = await db.getUser(req.body.username)
  console.log(user)
  bcrypt.compare(req.body.password, user.password, async (err, result) => {
    if (result === true) {
      const token = randstring.generate(20)
      await db.setTokenForUser(user.username, token)
      res.cookie('token', token)
      res.send(200)
    }
  })
})

router.get('/channels', async (req, res, next) => {
  res.send(await db.getChannels())
})

router.post('/channels', async (req, res, next) => {
  const user = await db.getUserByToken(req.headers.token)
  await db.createChannel(req.body.name, user.username)
  res.sendStatus(201)
})

router.get('/channel/:name/messages', async (req, res, next) => {
  res.send(await db.getMessagesForChannel(req.params.name))
})

router.post('/channel/:name/messages', async (req, res, next) => {
  await db.createMessage('test', req.params.name, req.body.message)
  res.sendStatus(201)
})

router.get('/:channel', (req, res, next) => {
  res.render('channel', { channel: req.params.channel })
})

module.exports = router
