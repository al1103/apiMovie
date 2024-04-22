const express = require('express');
const router = express.Router();


const syntheticController = require('../controller/syntheticController');
router.use('/changePassword', syntheticController.changePassword);
router.post('/forgotPassword', syntheticController.forgotPassword);
router.post('/resetPassword', syntheticController.resetPassword);


module.exports = router;