const express = require('express')
const { processPrompt} = require('../controllers/movie-controller')

const router = express.Router()

// router.get('/movies/by-cast', fetchMoviesByCast)

router.post('/search', processPrompt)

module.exports = router