const express = require('express');
const router = express.Router();
const UserController = require('../controller/usersController');

// router.post('/:id/comment', usersController.postComment);
// router.delete('/comment/:id', usersController.deleteComment);
// router.use('/update/:id', usersController.updateUser);
router.use('/login', UserController.authenticateUser);
router.use('/register', UserController.createUser);




module.exports = router;
