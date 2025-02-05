const Movie = require('../models/movie')
const axios = require('axios')
const {TMDB_API_KEY} =process.env;

const fetchMoviesByCast = async (req, res) => {
    const { castName } = req.query; // Get the cast member's name from the query parameters
  
    if (!castName) {
      return res.status(400).json({ message: 'Cast name is required' });
    }
  
    try {
      // Step 1: Search for the cast member's ID using their name
      const searchResponse = await axios.get(
        `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(castName)}`
      );
  
      const castMember = searchResponse.data.results[0];
  
      if (!castMember) {
        return res.status(404).json({ message: 'Cast member not found' });
      }
  
      const castId = castMember.id;
  
      // Step 2: Fetch movies featuring the cast member using their ID
      const moviesResponse = await axios.get(
        `https://api.themoviedb.org/3/person/${castId}/movie_credits?api_key=${TMDB_API_KEY}`
      );
  
      const movies = moviesResponse.data.cast.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date,
        overview: movie.overview,
        posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      }));
  
      // Step 3: Send the movies as a response
      res.status(200).json({ castName, movies });
    } catch (error) {
      console.error('Error fetching movies by cast:', error);
      res.status(500).json({ message: 'Failed to fetch movies', error: error.message });
    }
  };
  
  module.exports = { fetchMoviesByCast };

const fetchMovieDetails = async(req, res) =>{
    // const {movieId} = req.params
    console.log('inside fetch movie details')
    res.status(200).json("working")
}

module.exports = {fetchMoviesByCast, fetchMovieDetails}