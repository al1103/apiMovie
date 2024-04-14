const express = require('express');
const router = express.Router();

const authController = require('../controller/authControllers');


router.get('/updateMovie/:id', authController.UpdateMovie);
router.delete('/deletemovie/:id', authController.deleteMovie);
router.put('/edit/:slug', authController.editMovie);
router.get('/getListMovies', authController.listMovie);
router.post('/addMovie', authController.addMovie);
module.exports = router;
