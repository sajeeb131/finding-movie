const Movie = require('../models/movie');
const axios = require('axios');
const Cast = require('../models/cast');
const fetch = require('node-fetch');  // For OpenAI API requests

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 


const getMovieDetailsFromOpenAI = async (prompt) => {
  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: `Extract movie name, cast, year, genre, plot, and country from the following text: "${prompt}"`,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const movieDetails = data.choices[0].text.trim(); // Extract the movie details from the response
    return movieDetails;
  } catch (error) {
    console.error('Error fetching movie details from OpenAI:', error);
    throw error;
  }
};

// Function to search for cast suggestions
const showCastSuggestions = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: 'Cast name is required' });
  }

  try {
    const castMembers = await Cast.find({
      name: { $regex: name, $options: 'i' },
    }).limit(3);
    res.status(200).json(castMembers);
  } catch (err) {
    console.error('Error fetching cast members:', err);
    res.status(500).json({ message: 'Failed to fetch cast members', error: err.message });
  }
};

// Function to fetch movies based on cast name
const fetchMoviesByCast = async (req, res) => {
  const { castName } = req.query; // Get the cast member's name from the query parameters
  if (!castName) {
    return res.status(400).json({ message: 'Cast name is required' });
  }

  try {
    const searchResponse = await axios.get(
      `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(castName)}`
    );
    const castMember = searchResponse.data.results[0];

    if (!castMember) {
      return res.status(404).json({ message: 'Cast member not found' });
    }

    const castId = castMember.id;

    // Fetch movies featuring the cast member using their ID
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

    res.status(200).json({ castName, movies });
  } catch (error) {
    console.error('Error fetching movies by cast:', error);
    res.status(500).json({ message: 'Failed to fetch movies', error: error.message });
  }
};

// Function to fetch movie details (e.g., name, cast, year, genre) from a user prompt
const fetchMovieDetailsFromPrompt = async (req, res) => {
  const { prompt } = req.body; // The prompt provided by the user

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // Step 1: Get movie details from OpenAI
    const movieDetails = await getMovieDetailsFromOpenAI(prompt);

    // Step 2: Extract details from OpenAI response (you can use regex or manual extraction here)
    // For simplicity, let's just return the raw OpenAI response as a placeholder
    // You can improve this to parse the details as needed
    const parsedDetails = {
      details: movieDetails,
    };

    // Step 3: Optionally, use the extracted movie name and year to fetch more details from TMDB
    // Example of calling TMDB's search API based on extracted movie name
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(parsedDetails.details)}`
    );
    const movieResults = tmdbResponse.data.results;

    res.status(200).json({ movieDetails: parsedDetails, movies: movieResults });
  } catch (error) {
    console.error('Error processing movie details from prompt:', error);
    res.status(500).json({ message: 'Failed to fetch movie details', error: error.message });
  }
};

module.exports = { fetchMoviesByCast, fetchMovieDetailsFromPrompt, showCastSuggestions };
