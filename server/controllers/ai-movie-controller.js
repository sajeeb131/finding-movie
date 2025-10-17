// Enhanced movie controller using AI analysis
// This replaces the complex keyword extraction with OpenAI-powered analysis

const { analyzePrompt } = require('../services/ai-analyzer');
const { 
    searchMovies, 
    searchPerson, 
    fetchMoviesForEachActorSeparately, 
    fetchMovieTrailer, 
    searchByGenre,
    searchByTags,
    GENRE_IDS
} = require('../services/tmdb-service');

/**
 * Process user prompt using AI analysis and return relevant movies
 */
const processPromptWithAI = async (req, res) => {
    const prompt = req.body.prompt;
    console.log('Processing prompt with AI:', prompt);
    
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        // Step 1: Analyze prompt with AI
        const searchParams = await analyzePrompt(prompt);
        console.log('AI extracted parameters:', searchParams);
        
        // Step 2: Search for movies based on AI analysis
        const movies = await searchMoviesByParams(searchParams);
        console.log('Found movies:', movies.length);
        
        // Step 3: Enrich movies with additional details
        const enrichedMovies = await enrichMoviesWithDetails(movies);
        
        console.log('Final movies with details:', enrichedMovies.length);
        res.status(200).json({ movies: enrichedMovies });
    } catch (error) {
        console.error("Error processing prompt:", error);
        res.status(500).json({
            message: "Failed to process prompt",
            error: error.message
        });
    }
};

/**
 * Search for movies based on AI-extracted parameters using smart priority logic
 */
const searchMoviesByParams = async (params) => {
    console.log('Starting smart search with params:', params);
    
    // Step 1: Try exact movie name match first (highest priority)
    if (params.movieName) {
        console.log('Strategy 1: Searching by movie name:', params.movieName);
        const movieResults = await searchMovies({ query: params.movieName });
        
        if (movieResults.length > 0) {
            console.log('Found exact movie match, prioritizing over other searches');
            const topResults = movieResults
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, params.count || 5);
            console.log('Using exact match results:', topResults.map(m => `${m.title} (${m.release_date})`));
            return topResults;
        }
    }
    
    // Step 2: Actor-based search (high priority)
    if (params.actors && params.actors.length > 0) {
        console.log('Strategy 2: Searching by actors:', params.actors);
        
        // First, get the actor ID from TMDB
        const actorPromises = params.actors.map(async (actorName) => {
            const actor = await searchPerson(actorName);
            console.log(`Actor search for "${actorName}":`, actor ? `Found ID ${actor.id}` : 'Not found');
            return actor;
        });
        
        const actorResults = await Promise.all(actorPromises);
        const validActors = actorResults.filter(actor => actor !== null);
        
        if (validActors.length > 0) {
            console.log('Found valid actors:', validActors.map(a => `${a.name} (ID: ${a.id})`));
            
            // Search for movies with these actors
            const actorMovies = await fetchMoviesForEachActorSeparately(params.actors);
            console.log(`Found ${actorMovies.length} movies for actors`);
            
            if (actorMovies.length > 0) {
                // If we also have genres, filter by them
                let filteredMovies = actorMovies;
                if (params.genre && params.genre.length > 0) {
                    filteredMovies = actorMovies.filter(movie => {
                        const movieGenres = movie.genres || [];
                        return params.genre.some(genre =>
                            movieGenres.some(g => g.toLowerCase() === genre.toLowerCase())
                        );
                    });
                    console.log(`After genre filtering: ${filteredMovies.length} movies`);
                }
                
                const topResults = filteredMovies
                    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                    .slice(0, params.count || 8);
                console.log('Using actor search results:', topResults.map(m => `${m.title} (${m.release_date})`));
                return topResults;
            }
        } else {
            console.log('No valid actors found in TMDB');
        }
    }
    
    // Step 3: Genre-based search (medium priority)
    if (params.genre && params.genre.length > 0) {
        console.log('Strategy 3: Searching by genres:', params.genre);
        let genreMovies = await searchByGenre(params.genre);
        
        // If year is specified, filter by year
        if (params.year && genreMovies.length > 0) {
            const yearFilter = parseYearFilter(params.year);
            if (yearFilter) {
                console.log('Filtering genre results by year:', yearFilter);
                genreMovies = genreMovies.filter(movie => {
                    const movieYear = new Date(movie.release_date).getFullYear();
                    return movieYear === yearFilter;
                });
                console.log(`After year filtering: ${genreMovies.length} movies`);
            }
        }
        
        if (genreMovies.length > 0) {
            const topResults = genreMovies
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, params.count || 8);
            console.log('Using genre search results:', topResults.map(m => `${m.title} (${m.release_date})`));
            return topResults;
        }
    }
    
    // Step 4: Combined search (lower priority)
    const allMovies = new Set();
    
    // Year-based search
    if (params.year) {
        console.log('Searching by year:', params.year);
        const yearFilter = parseYearFilter(params.year);
        if (yearFilter) {
            const yearMovies = await searchMovies({ primary_release_year: yearFilter });
            yearMovies.forEach(movie => allMovies.add(movie));
        }
    }
    
    // Keyword-based search
    if (params.keywords && params.keywords.length > 0) {
        console.log('Searching by keywords:', params.keywords);
        const keywordMovies = await searchByTags(params.keywords);
        keywordMovies.forEach(movie => allMovies.add(movie));
    }
    
    // Mood-based search
    if (params.mood) {
        console.log('Searching by mood:', params.mood);
        const moodMovies = await searchByMood(params.mood);
        moodMovies.forEach(movie => allMovies.add(movie));
    }
    
    // If we found movies from combined search
    if (allMovies.size > 0) {
        const uniqueMovies = Array.from(allMovies);
        const topResults = uniqueMovies
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, params.count || 8);
        console.log('Using combined search results:', topResults.map(m => `${m.title} (${m.release_date})`));
        return topResults;
    }
    
    // Step 5: General search (fallback)
    console.log('No movies found with specific criteria, doing general search');
    const generalMovies = await searchMovies({});
    const topResults = generalMovies
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, params.count || 8);
    console.log('Using general search results:', topResults.map(m => `${m.title} (${m.release_date})`));
    
    return topResults;
};

/**
 * Enrich movies with trailers, genres, and actors
 */
const enrichMoviesWithDetails = async (movies) => {
    const enrichedMovies = [];
    
    for (const movie of movies) {
        try {
            const details = await fetchMovieTrailer(movie.id);
            enrichedMovies.push({
                ...movie,
                ...details
            });
        } catch (error) {
            console.error(`Error enriching movie ${movie.id}:`, error.message);
            enrichedMovies.push(movie);
        }
    }
    
    return enrichedMovies;
};

/**
 * Parse year filter from various year formats
 */
const parseYearFilter = (yearString) => {
    if (!yearString) return null;
    
    // Exact year: 1994
    const exactYear = yearString.match(/\b(19|20)\d{2}\b/);
    if (exactYear) {
        return parseInt(exactYear[0]);
    }
    
    // Decade: 1990s, 90s
    const decade = yearString.match(/\b(19|20)?(\d{0})s\b/);
    if (decade) {
        const century = decade[1] || '19';
        const decadeDigit = decade[2];
        return parseInt(century + decadeDigit + '0');
    }
    
    return null;
};

/**
 * Search movies by mood (map mood to genres/keywords)
 */
const searchByMood = async (mood) => {
    const moodMappings = {
        'funny': { genres: ['comedy'], keywords: ['funny', 'humor'] },
        'scary': { genres: ['horror'], keywords: ['scary', 'terror'] },
        'romantic': { genres: ['romance'], keywords: ['romantic', 'love'] },
        'sad': { genres: ['drama'], keywords: ['sad', 'emotional'] },
        'exciting': { genres: ['action', 'thriller'], keywords: ['exciting', 'adventure'] },
        'thrilling': { genres: ['thriller', 'action'], keywords: ['thrilling', 'suspense'] }
    };
    
    const mapping = moodMappings[mood.toLowerCase()];
    if (!mapping) return [];
    
    const movies = [];
    
    // Search by genres
    if (mapping.genres && mapping.genres.length > 0) {
        const genreMovies = await searchByGenre(mapping.genres);
        movies.push(...genreMovies);
    }
    
    // Search by keywords
    if (mapping.keywords && mapping.keywords.length > 0) {
        const keywordMovies = await searchByTags(mapping.keywords);
        movies.push(...keywordMovies);
    }
    
    return movies;
};

/**
 * Test endpoint to verify AI analysis is working
 */
const testAIAnalysis = async (req, res) => {
    try {
        const { testAnalysis } = require('../services/ai-analyzer');
        await testAnalysis();
        res.status(200).json({ message: 'AI analysis test completed. Check server logs for results.' });
    } catch (error) {
        console.error('Test failed:', error);
        res.status(500).json({ message: 'Test failed', error: error.message });
    }
};

module.exports = {
    processPromptWithAI,
    testAIAnalysis
};