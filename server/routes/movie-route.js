const express = require('express')
const {find, processPrompt} = require('../controllers/movie-controller')

const router = express.Router()

// router.get('/movies/by-cast', fetchMoviesByCast)
router.post('/find', find)
router.post('/search', processPrompt)

module.exports = router