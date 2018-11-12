const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../db')

const saltRounds = 10

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express Chat' })
})

router.get('/signup', (req, res, nex) => {
  res.render('signup', { })
})

router.post('/signup', (req, res, next) => {
  db.getUser(req.body.username, (err, row) => {
    if (err) {
      throw err
    }

    if (!row) {
      bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
          throw err
        }

        db.createUser(req.body.username, hash)
        res.sendStatus(201, { message: 'User successfully created' })
      })
    } else {
      res.sendStatus(403, { error: 'User already exists in database' })
    }
  })
})

module.exports = router
