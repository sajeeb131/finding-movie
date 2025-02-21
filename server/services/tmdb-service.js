const axios = require('axios');
const { TMDB_API_URL } = require('../utils/constants');
const { TMDB_API_KEY } = process.env;

// TMDb Genre ID mapping
const GENRE_IDS = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'history': 36,
    'horror': 27,
    'music': 10402,
    'mystery': 9648,
    'romance': 10749,
    'science fiction': 878,
    'tv movie': 10770,
    'thriller': 53,
    'war': 10752,
    'western': 37
};

// Create an Axios instance with retries and timeout
const apiClient = axios.create({
    baseURL: TMDB_API_URL,
    timeout: 10000, // 10 seconds timeout
    params: { api_key: TMDB_API_KEY },
});

// Add retry logic for network errors
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

const withRetry = async (fn, retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.code === 'ECONNRESET' && i < retries - 1) {
                console.log(`Retry ${i + 1}/${retries} after ECONNRESET`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
                continue;
            }
            throw error;
        }
    }
};

// Function to search movies with given query parameters
const searchMovies = async (queryParams) => {
    try {
        const response = await withRetry(() =>
            apiClient.get('/discover/movie', { params: queryParams })
        );
        return response.data.results || [];
    } catch (error) {
        console.error('Error in searchMovies:', error.message);
        return [];
    }
};

// Function to get actor or director ID from TMDb
const searchPerson = async (name) => {
    if (!name) return null;
    try {
        const encodedName = encodeURIComponent(name);
        const response = await withRetry(() =>
            apiClient.get('/search/person', { params: { query: encodedName } })
        );
        if (!response.data?.results?.length) {
            console.log(`No results found for person: ${name}`);
            return null;
        }
        return response.data.results[0];
    } catch (error) {
        console.error(`Error searching for person (${name}):`, error.message);
        return null;
    }
};

// Fetch movies where all actors appear together
const fetchMoviesForAllActorsTogether = async (actorNames) => {
    const actorIds = [];
    for (const name of actorNames) {
        const actor = await searchPerson(name);
        if (actor && actor.id) actorIds.push(actor.id);
    }
    if (actorIds.length > 0) {
        return await searchMovies({ with_cast: actorIds.join(',') });
    }
    return [];
};

// Fetch movies for each actor separately
const fetchMoviesForEachActorSeparately = async (actorNames) => {
    let movies = [];
    for (const name of actorNames) {
        const actor = await searchPerson(name);
        if (actor && actor.id) {
            const actorMovies = await searchMovies({ with_cast: actor.id });
            movies = movies.concat(actorMovies.slice(0, 5));
        }
    }
    return movies;
};

// Search movies by genre
const searchByGenre = async (genreNames) => {
    if (!genreNames || genreNames.length === 0) return [];
    const genreIds = genreNames
        .map(name => GENRE_IDS[name.toLowerCase()])
        .filter(id => id !== undefined);
    if (genreIds.length === 0) return [];
    try {
        const response = await withRetry(() =>
            apiClient.get('/discover/movie', { params: { with_genres: genreIds.join(',') } })
        );
        return response.data.results || [];
    } catch (error) {
        console.error('Error in searchByGenre:', error.message);
        return [];
    }
};

// Function to fetch movie trailers and genres
const fetchMovieTrailer = async (movieId) => {
    try {
        const response = await withRetry(() =>
            apiClient.get(`/movie/${movieId}`, { params: { append_to_response: 'videos' } })
        );
        const movieData = response.data;
        const genres = movieData.genres ? movieData.genres.map(genre => genre.name.toLowerCase()) : [];
        const trailers = movieData.videos.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
        const trailerUrl = trailers.length > 0 ? `https://www.youtube.com/watch?v=${trailers[0].key}` : null;
        return { trailerUrl, genres };
    } catch (error) {
        console.error(`Error fetching details for movie ID ${movieId}:`, error.message);
        return { trailerUrl: null, genres: [] };
    }
};

module.exports = { 
    searchMovies, 
    searchPerson, 
    fetchMoviesForAllActorsTogether, 
    fetchMoviesForEachActorSeparately, 
    searchByGenre, 
    fetchMovieTrailer 
};