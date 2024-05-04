const express = require('express');
const router = express.Router();

const authController = require('../controller/authControllers');
const Movies = require('../controller/Movies');

// User Management
router.get('/users', authController.getListUsers);
 // Assuming you want to retrieve a single user by ID

// Movie Management

router.get('/movies', Movies.getAllMovies);
router.post('/movies', authController.addMovie);
router.get('/movies/:id', authController.getOneMovieAdmin);
router.put('/movies/:id', authController.UpdateMovie);
router.delete('/movies/:id', authController.deleteMovie);

// Comment Management
router.get('/comments/:id', authController.getComments); // Assuming comments can be for users or movies based on ID

module.exports = router;
