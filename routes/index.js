const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../app/db')

const saltRounds = 10

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express Chat' })
})

router.get('/signup', (req, res, nex) => {
  res.render('signup', {})
})

router.post('/signup', async (req, res, next) => {
  bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    if (err) {
      throw err
    }
    await db.createUser(req.body.username, hash)
    res.sendStatus(201)
  })
})

module.exports = router
