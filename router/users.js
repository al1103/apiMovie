const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');

router.post('/:id/comment', usersController.postComment);
router.delete('/comment/:id', usersController.deleteComment);
router.use('/update/:id', usersController.updateUser);
router.use('/AddFavorite', usersController.AddFavorite);
router.use('/login', usersController.authenticateUser);
router.use('/register', usersController.createUser);
router.use('/app', usersController.loginFacebook);
router.use('/getFB', usersController.getUsersFB);
router.put('/UpdateService', usersController.UpdateService);
router.use('/getFavorite', usersController.GetFavorite);
router.use('/DeleteFavorite/:id', usersController.DeleteFavorite);


router.post('/ApplyCode', usersController.ApplyCode);


module.exports = router;
