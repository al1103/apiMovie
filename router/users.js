const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');

router.post('/:id/comment', usersController.postComment);
router.delete('/comment/:id', usersController.deleteComment);
router.use('/update/:id', usersController.updateUser);
router.use('/login', usersController.authenticateUser);
router.use('/register', usersController.createUser);
router.use('/app', usersController.loginFacebook);
router.use('/getFB', usersController.getUsersFB);
router.put('/UpdateService', usersController.UpdateService);
router.post('/ApplyCode', usersController.ApplyCode);


module.exports = router;
