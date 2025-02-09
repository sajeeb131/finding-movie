const express = require('express')
const { fetchMoviesByCast, fetchMovieDetails, getMovieDetailsFromOpenAI} = require('../controllers/movie-controller')

const router = express.Router()

router.get('/movies/by-cast', fetchMoviesByCast)
router.get('/movies', fetchMovieDetails)
router.get('/search', getMovieDetailsFromOpenAI)

module.exports = router