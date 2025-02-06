const express = require('express')
const { fetchMoviesByCast, fetchMovieDetails, fetchCastSuggestions} = require('../controllers/movie-controller')

const router = express.Router()

router.get('/movies/by-cast', fetchMoviesByCast)
router.get('/movies', fetchMovieDetails)
// router.get('/search', fetchCastSuggestions)

module.exports = router