const express = require('express')
const { fetchMoviesByCast, fetchMovieDetails} = require('../controllers/movie-controller')

const router = express.Router()

router.get('/movies/by-cast', fetchMoviesByCast)
router.get('/movies', fetchMovieDetails)

module.exports = router