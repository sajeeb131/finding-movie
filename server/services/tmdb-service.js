const axios = require('axios');
const { TMDB_API_URL } = require('../utils/constants');
const { TMDB_API_KEY } = process.env;

// Function to search movies with given query parameters
const searchMovies = async (queryParams) => {
    console.log('The TMDB API KEY: ', TMDB_API_KEY);
    try {
        const response = await axios.get(`${TMDB_API_URL}/discover/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                ...queryParams
            }
        });

        return response.data.results || []; // Ensure an array is always returned
    } catch (error) {
        console.error('Error in searchMovies:', error);
        return []; // Return empty array on failure
    }
};

// Function to get actor or director ID from TMDb
const searchPerson = async (name) => {
    if (!name) return null; // Prevent errors if name is empty

    try {
        // Use encodeURIComponent for the search term to handle spaces and special characters
        name = encodeURIComponent(name); 
        
        const response = await axios.get(`${TMDB_API_URL}/search/person`, {
            params: {
                api_key: TMDB_API_KEY,
                query: name
            }
        });

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            console.log(`No results found for person: ${name}`);
            return null;
        }

        return response.data.results[0]; // Return the first result
    } catch (error) {
        console.error(`Error searching for person (${name}):`, error);
        return null;
    }
};


const fetchMoviesForAllActorsTogether = async (actorNames) => {
    const actorIds = [];
    for (const name of actorNames) {
        const actor = await searchPerson(name);
        if (actor && actor.id) {
            actorIds.push(actor.id);
        }
    }

    if (actorIds.length > 0) {
        return await searchMovies({ with_cast: actorIds.join(',') }); // Fetch for all actors together
    }

    return [];
};

const fetchMoviesForEachActorSeparately = async (actorNames) => {
    let movies = [];
    
    for (const name of actorNames) {
        const actor = await searchPerson(name);
        if (actor && actor.id) {
            const actorMovies = await searchMovies({ with_cast: actor.id });
            movies = movies.concat(actorMovies.slice(0, 5)); // Limit to 5 per actor
        }
    }

    return movies;
};

// Function to fetch movie trailers
const fetchMovieTrailer = async (movieId) => {
    try {
        const response = await axios.get(`${TMDB_API_URL}/movie/${movieId}/videos`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });

        // Find the trailer from the response
        const trailers = response.data.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailers.length > 0) {
            return `https://www.youtube.com/watch?v=${trailers[0].key}`; // Return the YouTube URL of the first trailer
        }

        return null; // No trailer found
    } catch (error) {
        console.error(`Error fetching trailer for movie ID ${movieId}:`, error);
        return null; // Return null if there's an error
    }
};


module.exports = { searchMovies, searchPerson, fetchMoviesForAllActorsTogether, fetchMoviesForEachActorSeparately, fetchMovieTrailer };

