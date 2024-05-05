const express = require('express');
const router = express.Router();
const Pay = require('../controller/zaloPayController');

router.post('/Zalo', Pay.createOrder);


module.exports = router;    