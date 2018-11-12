const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/:user', (req, res, next) => {
  res.render('pm', {
    user: req.params.user
  })
})

module.exports = router
