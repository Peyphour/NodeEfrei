const express = require('express')
const router = express.Router()

router.get('/:user', (req, res, next) => {
  res.render('pm', {
    user: req.params.user
  })
})

module.exports = router
