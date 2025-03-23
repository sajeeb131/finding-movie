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

// Function to search movies by keywords (tags)
const searchByTags = async (tags) => {
    if (!tags || tags.length === 0) return [];
    
    try {
        // Use TMDB's keyword search functionality
        // First get keyword IDs from the tags
        const tagResults = [];
        
        for (const tag of tags) {
            // Search for keyword ID
            const keywordResponse = await withRetry(() =>
                apiClient.get('/search/keyword', { params: { query: tag } })
            );
            
            if (keywordResponse.data.results && keywordResponse.data.results.length > 0) {
                const keywordId = keywordResponse.data.results[0].id;
                
                // Search for movies with this keyword
                const moviesResponse = await withRetry(() =>
                    apiClient.get('/discover/movie', { params: { with_keywords: keywordId } })
                );
                
                if (moviesResponse.data.results && moviesResponse.data.results.length > 0) {
                    tagResults.push(...moviesResponse.data.results);
                }
            }
        }
        
        // Remove duplicates
        return [...new Map(tagResults.map(movie => [movie.id, movie])).values()];
        
    } catch (error) {
        console.error('Error in searchByTags:', error.message);
        return [];
    }
};

// Function to fetch movie trailers, genres, and actors (credits)
// Uses append_to_response to get both videos and credits in one call
const fetchMovieTrailer = async (movieId) => {
    try {
        const response = await withRetry(() =>
            apiClient.get(`/movie/${movieId}`, { params: { append_to_response: 'videos,credits' } })
        );
        const movieData = response.data;
        const genres = movieData.genres ? movieData.genres.map(genre => genre.name.toLowerCase()) : [];
        const trailers = movieData.videos.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
        const trailerUrl = trailers.length > 0 ? `https://www.youtube.com/watch?v=${trailers[0].key}` : null;
        
        // Fetch up to 8 actors from credits
        const actors = movieData.credits && movieData.credits.cast
          ? movieData.credits.cast.slice(0, 12).map(actor => ({
                id: actor.id,
                name: actor.name,
                profile_path: actor.profile_path,
            }))
          : [];
          
        return { trailerUrl, genres, actors };
    } catch (error) {
        console.error(`Error fetching details for movie ID ${movieId}:`, error.message);
        return { trailerUrl: null, genres: [], actors: [] };
    }
};

// Export the new function along with existing ones
module.exports = { 
    searchMovies, 
    searchPerson, 
    fetchMoviesForAllActorsTogether, 
    fetchMoviesForEachActorSeparately, 
    searchByGenre, 
    fetchMovieTrailer,
    searchByTags,
    GENRE_IDS // Make sure to export GENRE_IDS if needed elsewhere
};
