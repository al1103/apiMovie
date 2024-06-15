const express = require('express');
const router = express.Router();


const syntheticController = require('../controller/syntheticController');
router.get('/users/:id', syntheticController.getUser);
router.use('/changePassword', syntheticController.changePassword);
router.post('/forgotPassword', syntheticController.forgotPassword);
router.put('/users/:id', syntheticController.UpdateUser);
router.delete('/users/:id', syntheticController.deleteUser);
router.post('/resetPassword', syntheticController.resetPassword);



module.exports = router;    