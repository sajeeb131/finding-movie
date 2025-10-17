// Enhanced relevance scoring system for movie recommendations
const { calculateSemanticSimilarity } = require('./semantic-matcher');
const { GENRE_IDS } = require('../utils/constants');

/**
 * Calculate a comprehensive relevance score for a movie based on user query
 * @param {Object} movie - Movie object from TMDB
 * @param {Object} query - Parsed query object from keyword extraction
 * @param {Object} userHistory - Optional user interaction history
 * @returns {Object} - Score object with total score and factor breakdown
 */
const calculateRelevanceScore = async (movie, query, userHistory = null) => {
    let score = 0;
    const factors = {};
    
    // 1. Exact title match (highest weight)
    if (query.movieName) {
        factors.exactMatch = calculateExactMatchScore(movie, query.movieName);
        score += factors.exactMatch * 0.35; // Increased weight for exact matches
    }
    
    // 2. Actor relevance factor
    if (query.actorNames && query.actorNames.length > 0) {
        factors.actorMatch = calculateActorRelevance(movie, query.actorNames);
        score += factors.actorMatch * 0.25;
    }
    
    // 3. Genre relevance factor
    if (query.genre && query.genre.length > 0) {
        factors.genreMatch = calculateGenreRelevance(movie, query.genre);
        score += factors.genreMatch * 0.20;
    }
    
    // 4. Tag/keyword relevance factor
    if (query.tags && query.tags.length > 0) {
        factors.tagMatch = calculateTagRelevance(movie, query.tags);
        score += factors.tagMatch * 0.15;
    }
    
    // 5. Semantic similarity factor (for "movies like X" queries)
    if (query.semanticEmbedding && movie.embedding) {
        factors.semanticSimilarity = await calculateSemanticSimilarity(movie, query.semanticEmbedding);
        score += factors.semanticSimilarity * 0.15;
    }
    
    // 6. Contextual factors (recency, popularity, user preferences)
    factors.contextual = calculateContextualScore(movie, query, userHistory);
    score += factors.contextual * 0.10;
    
    // 7. Release year relevance
    if (query.releaseYear) {
        factors.yearMatch = calculateYearRelevance(movie, query.releaseYear);
        score += factors.yearMatch * 0.05;
    }
    
    return { 
        totalScore: Math.min(score, 1.0), // Cap at 1.0
        factors,
        movieId: movie.id
    };
};

/**
 * Calculate exact title match score
 */
const calculateExactMatchScore = (movie, movieName) => {
    if (!movie.title || !movieName) return 0;
    
    const title = movie.title.toLowerCase();
    const searchTitle = movieName.toLowerCase();
    
    // Exact match
    if (title === searchTitle) return 1.0;
    
    // Contains match
    if (title.includes(searchTitle) || searchTitle.includes(title)) return 0.8;
    
    // Word-level matching
    const titleWords = title.split(' ');
    const searchWords = searchTitle.split(' ');
    const commonWords = titleWords.filter(word => searchWords.includes(word));
    
    if (commonWords.length > 0) {
        return commonWords.length / Math.max(titleWords.length, searchWords.length);
    }
    
    return 0;
};

/**
 * Calculate actor relevance score
 */
const calculateActorRelevance = (movie, actorNames) => {
    if (!movie.credits || !movie.credits.cast || !actorNames.length) return 0;
    
    const castActors = movie.credits.cast.map(actor => actor.name.toLowerCase());
    const queryActors = actorNames.map(name => name.toLowerCase());
    
    let matchCount = 0;
    let totalWeight = 0;
    
    queryActors.forEach(queryActor => {
        // Check for exact matches
        const exactMatch = castActors.findIndex(castActor => 
            castActor === queryActor || castActor.includes(queryActor) || queryActor.includes(castActor)
        );
        
        if (exactMatch !== -1) {
            // Higher weight for top-billed actors
            const actorPosition = exactMatch;
            const weight = Math.max(0.5, 1 - (actorPosition / 10)); // Decreasing weight based on billing position
            matchCount += weight;
        }
        
        totalWeight += 1;
    });
    
    return totalWeight > 0 ? matchCount / totalWeight : 0;
};

/**
 * Calculate genre relevance score
 */
const calculateGenreRelevance = (movie, queryGenres) => {
    if (!movie.genres || !queryGenres.length) return 0;
    
    const movieGenres = movie.genres.map(genre => genre.name.toLowerCase());
    const normalizedQueryGenres = queryGenres.map(genre => genre.toLowerCase());
    
    let matchCount = 0;
    
    normalizedQueryGenres.forEach(queryGenre => {
        if (movieGenres.includes(queryGenre)) {
            matchCount += 1;
        }
    });
    
    return matchCount / normalizedQueryGenres.length;
};

/**
 * Calculate tag/keyword relevance score
 */
const calculateTagRelevance = (movie, queryTags) => {
    if (!movie.keywords && !movie.overview) return 0;
    
    const movieText = [
        ...(movie.keywords?.results?.map(k => k.name) || []),
        movie.overview || '',
        ...(movie.genres?.map(g => g.name) || [])
    ].join(' ').toLowerCase();
    
    let matchCount = 0;
    
    queryTags.forEach(tag => {
        if (movieText.includes(tag.toLowerCase())) {
            matchCount += 1;
        }
    });
    
    return matchCount / queryTags.length;
};

/**
 * Calculate contextual score based on various factors
 */
const calculateContextualScore = (movie, query, userHistory) => {
    let score = 0;
    
    // Popularity boost
    if (movie.popularity) {
        // Normalize popularity (TMDB popularity typically ranges 0-1000)
        const popularityScore = Math.min(movie.popularity / 100, 1.0);
        score += popularityScore * 0.3;
    }
    
    // Vote average boost
    if (movie.vote_average) {
        // Normalize vote average (TMDB vote average is 0-10)
        const ratingScore = movie.vote_average / 10;
        score += ratingScore * 0.3;
    }
    
    // Release date recency boost (for queries suggesting recent content)
    if (movie.release_date) {
        const releaseYear = new Date(movie.release_date).getFullYear();
        const currentYear = new Date().getFullYear();
        const yearsDiff = currentYear - releaseYear;
        
        // Boost for recent movies (last 5 years)
        if (yearsDiff <= 5) {
            score += (1 - yearsDiff / 5) * 0.2;
        }
        
        // Boost for classic movies (older than 20 years)
        if (yearsDiff >= 20) {
            score += 0.1;
        }
    }
    
    // User history boost (if available)
    if (userHistory && userHistory.preferredGenres) {
        const userGenres = userHistory.preferredGenres;
        const movieGenres = movie.genres?.map(g => g.name.toLowerCase()) || [];
        
        const genreOverlap = userGenres.filter(genre => 
            movieGenres.includes(genre.toLowerCase())
        ).length;
        
        if (genreOverlap > 0) {
            score += (genreOverlap / userGenres.length) * 0.2;
        }
    }
    
    return Math.min(score, 1.0);
};

/**
 * Calculate release year relevance
 */
const calculateYearRelevance = (movie, queryYear) => {
    if (!movie.release_date || !queryYear) return 0;
    
    const movieYear = new Date(movie.release_date).getFullYear();
    const yearDiff = Math.abs(movieYear - parseInt(queryYear));
    
    // Exact match
    if (yearDiff === 0) return 1.0;
    
    // Within 2 years
    if (yearDiff <= 2) return 0.8;
    
    // Within 5 years
    if (yearDiff <= 5) return 0.6;
    
    // Within 10 years
    if (yearDiff <= 10) return 0.4;
    
    // More than 10 years
    return 0.2;
};

/**
 * Rank and sort movies by relevance score
 */
const rankMoviesByRelevance = async (movies, query, userHistory = null) => {
    // Calculate scores for all movies
    const scoredMovies = await Promise.all(
        movies.map(async (movie) => {
            const score = await calculateRelevanceScore(movie, query, userHistory);
            return { ...movie, ...score };
        })
    );
    
    // Sort by total score (descending)
    return scoredMovies.sort((a, b) => b.totalScore - a.totalScore);
};

/**
 * Get top N movies by relevance
 */
const getTopMoviesByRelevance = async (movies, query, limit = 10, userHistory = null) => {
    const rankedMovies = await rankMoviesByRelevance(movies, query, userHistory);
    return rankedMovies.slice(0, limit);
};

module.exports = {
    calculateRelevanceScore,
    rankMoviesByRelevance,
    getTopMoviesByRelevance,
    calculateExactMatchScore,
    calculateActorRelevance,
    calculateGenreRelevance,
    calculateTagRelevance,
    calculateContextualScore,
    calculateYearRelevance
};