const express = require('express');
const router = express.Router();


const Pay = require('../controller/zaloPay');
router.post('/Zalo', Pay.createOrder);


module.exports = router;    