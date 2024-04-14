const express = require('express');
const router = express.Router();

const Movies = require('../controller/Movies');

router.get('/Search', Movies.SearchMovie);
router.get('/:slug', Movies.getOneMovie);
router.get('/', Movies.index);

module.exports = router;

