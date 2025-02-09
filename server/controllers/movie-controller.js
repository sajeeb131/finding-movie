const Movie = require('../models/movie');
const axios = require('axios');
const Cast = require('../models/cast');
const { extractKeywords } = require('../services/keyword-service');
const { searchMovies } = require('../services/tmdb-service');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const find = async (req, res) => {
  const casts = await Cast.find({});
  res.status(200).json(casts);
}

const processPrompt = async(req, res) =>{
  const prompt = req.body.prompt;
    if(!prompt){
      return res.status(400).json({message: 'prompt is required'});
    }
    try{
      console.log('inside the controller -- Prompt:', prompt);
      const keywords = extractKeywords(prompt);
      console.log(keywords)
      res.status(200).json({message: 'Prompt processed successfully', keywords});
    }catch(error){
      console.error('Error processing prompt:', error);
      res.status(500).json({message: 'Failed to process prompt', error: error.message});
    }
    // try{
    //   // step1 : extract keywords from the prompt
    //   const keywords = extractKeywords(prompt);
  
  //   const queries = {};

  //   //step 2: build TMDB api query based on prioritized keywords
  //   if(keywords.movieName) queries.query = keywords.movieName;
  //   else{
  //     if(keywords.castName) queries.actorName = keywords.actorName;
  //     if(keywords.year) queries.year = keywords.year;
  //     if(keywords.genre) queries.genre = keywords.genre;
  //     if(keywords.director) queries.director = keywords.director;
  //   }

  //   // step3 : make a request to TMDB API to fetch movies based on the extracted keywords
  //   const movies = await searchMovies(queryParams);
  //   console.log('Movies:', movies);
  //   res.status(200).json({movies});
    
  // }catch(error){
  //   console.error('Error processing prompt:', error);
  //   res.status(500).json({message: 'Failed to process prompt', error: error.message});
  // }
}


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
// const fetchMoviesByCast = async (req, res) => {
//   const { castName } = req.query; // Get the cast member's name from the query parameters
//   if (!castName) {
//     return res.status(400).json({ message: 'Cast name is required' });
//   }

//   try {
//     const searchResponse = await axios.get(
//       `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(castName)}`
//     );
//     const castMember = searchResponse.data.results[0];

//     if (!castMember) {
//       return res.status(404).json({ message: 'Cast member not found' });
//     }

//     const castId = castMember.id;

//     // Fetch movies featuring the cast member using their ID
//     const moviesResponse = await axios.get(
//       `https://api.themoviedb.org/3/person/${castId}/movie_credits?api_key=${TMDB_API_KEY}`
//     );

//     const movies = moviesResponse.data.cast.map((movie) => ({
//       id: movie.id,
//       title: movie.title,
//       releaseDate: movie.release_date,
//       overview: movie.overview,
//       posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
//     }));

//     res.status(200).json({ castName, movies });
//   } catch (error) {
//     console.error('Error fetching movies by cast:', error);
//     res.status(500).json({ message: 'Failed to fetch movies', error: error.message });
//   }
// };


module.exports = {  find, processPrompt, showCastSuggestions };


