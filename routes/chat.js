const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const randstring = require('randomstring')
const db = require('../db')

router.get('/', (req, res, next) => {
  res.render('chat', {})
})

router.post('/login', (req, res, next) => {
  db.getUser(req.body.username, (err, row) => {
    if (err) {
      res.sendStatus(403)
    } else {
      const user = row
      if (user === undefined) {
        res.sendStatus(403)
      } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (result === true) {
            const token = randstring.generate(20)
            db.setTokenForUser(user.username, token)
            res.send({
              token: token
            })
          }
        })
      }
    }
  })
})

router.get('/channels', (req, res, next) => {
  db.getChannels((err, rows) => {
    if (err) {
      res.sendStatus(500)
    }
    res.send(rows)
  })
})

router.post('/channels', (req, res, next) => {
  db.getUserByToken(req.headers.token, (err, row) => {
    if (err) {
      res.sendStatus(500)
    }
    db.createChannel(req.body.name, row.username)
    res.sendStatus(201)
  })
})

router.get('/channel/:name/messages', (req, res, next) => {
  db.getMessagesForChannel(req.params.name, (err, rows) => {
    if (err) {
      res.sendStatus(500)
    }
    res.send(rows)
  })
})

router.post('/channel/:name/messages', (req, res, next) => {
  db.createMessage('test', req.params.name, req.body.message)
  res.sendStatus(201)
})

router.get('/:channel', (req, res, next) => {
  res.render('channel', { channel: req.params.channel })
})

module.exports = router
