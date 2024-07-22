const express = require('express')
const controler = require('../controller/apikey.controller')
const verifyToken = require('../midleware/auth')
const router = express.Router()

router.post('/register',controler.register)
router.post('/list',controler.list)
router.post('/destroy',controler.destroy)
//--------------
module.exports = router;