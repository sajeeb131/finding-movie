const {
    searchMovies,
    searchPerson,
    fetchMoviesForAllActorsTogether,
    fetchMoviesForEachActorSeparately,
    fetchMovieTrailer,
    searchByGenre,
    searchByTags,
    GENRE_IDS
} = require('../services/tmdb-service');
const { extractKeywords } = require('../services/keyword-service');
const { getTopMoviesByRelevance } = require('../services/relevance-scoring');
const { generateEmbedding, createMovieEmbeddings } = require('../services/semantic-matcher');

const processPrompt = async (req, res) => {
    const prompt = req.body.prompt;
    console.log('Processing prompt:', prompt);
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        // Step 1: Extract keywords from the prompt
        const keywords = await extractKeywords(prompt);
        console.log('Extracted keywords:', keywords);
        
        // Step 2: Generate semantic embedding for the query
        if (keywords.movieName || keywords.tags?.length > 0) {
            const queryText = [
                keywords.movieName || '',
                ...(keywords.tags || []),
                ...(keywords.genre || [])
            ].join(' ');
            keywords.semanticEmbedding = generateEmbedding(queryText);
        }
        
        // Step 3: Fetch candidate movies using multiple strategies
        const candidateMovies = await fetchCandidateMovies(keywords);
        console.log('Found candidate movies:', candidateMovies.length);
        
        // Step 4: Create embeddings for all candidate movies
        const moviesWithEmbeddings = createMovieEmbeddings(candidateMovies);
        
        // Step 5: Score and rank movies by relevance
        const rankedMovies = await getTopMoviesByRelevance(moviesWithEmbeddings, keywords, 12);
        console.log('Ranked movies:', rankedMovies.length);
        
        // Step 6: Fetch trailers, genres, and actors for top movies
        for (let i = 0; i < Math.min(rankedMovies.length, 8); i++) {
            const movie = rankedMovies[i];
            const { trailerUrl, genres, actors } = await fetchMovieTrailer(movie.id);
            rankedMovies[i] = { ...movie, trailerUrl, genres, actors };
        }

        console.log('Final movies with details:', rankedMovies.length);
        res.status(200).json({ movies: rankedMovies });
    } catch (error) {
        console.error("Error processing prompt:", error);
        res.status(500).json({
            message: "Failed to process prompt",
            error: error.message
        });
    }
};

/**
 * Fetch candidate movies using multiple search strategies
 */
const fetchCandidateMovies = async (keywords) => {
    const candidates = new Set();
    const queries = {};
    
    // Strategy 1: Direct movie search (highest priority)
    if (keywords.movieName) {
        const directResults = await searchMovies({ query: keywords.movieName });
        directResults.forEach(movie => candidates.add(movie));
    }
    
    // Strategy 2: Actor-based search
    if (keywords.actorNames && keywords.actorNames.length > 0) {
        const moviesSeparately = await fetchMoviesForEachActorSeparately(keywords.actorNames);
        moviesSeparately.forEach(movie => candidates.add(movie));
    }
    
    // Strategy 3: Tag-based search
    if (keywords.tags && keywords.tags.length > 0) {
        console.log('Searching for movies with tags:', keywords.tags);
        const tagMovies = await searchByTags(keywords.tags);
        tagMovies.forEach(movie => candidates.add(movie));
    }
    
    // Strategy 4: Genre-based search
    if (keywords.genre && keywords.genre.length > 0) {
        const genreMovies = await searchByGenre(keywords.genre);
        genreMovies.forEach(movie => candidates.add(movie));
    }
    
    // Strategy 5: Add temporal filters
    if (keywords.releaseYear) {
        queries.primary_release_year = keywords.releaseYear;
    }
    
    // Strategy 6: General search if no specific criteria found
    if (candidates.size === 0) {
        const generalResults = await searchMovies(queries);
        generalResults.slice(0, 10).forEach(movie => candidates.add(movie));
    }
    
    return Array.from(candidates);
};

module.exports = { processPrompt };
