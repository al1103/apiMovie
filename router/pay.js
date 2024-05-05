const express = require('express');
const router = express.Router();
const Pay = require('../controller/zaloPayController');

router.post('/Zalo', Pay.createOrder);
router.post('/Zalo/callback', Pay.callback);


module.exports = router;    