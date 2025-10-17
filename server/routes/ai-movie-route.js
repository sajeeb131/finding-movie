const express = require('express');
const { processPromptWithAI, testAIAnalysis } = require('../controllers/ai-movie-controller');

const router = express.Router();

// Main AI-powered movie search endpoint
router.post('/search', processPromptWithAI);

// Test endpoint for AI analysis
router.get('/test', testAIAnalysis);

// Test specific prompt analysis
router.post('/test-prompt', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }
    
    try {
        const { analyzePrompt } = require('../services/ai-analyzer');
        const { searchMovies, fetchMovieTrailer } = require('../services/tmdb-service');
        
        console.log('Testing prompt:', prompt);
        
        // Step 1: Analyze with AI
        const searchParams = await analyzePrompt(prompt);
        console.log('AI extracted parameters:', searchParams);
        
        // Step 2: Search TMDB
        let movies = [];
        if (searchParams.movieName) {
            console.log('Searching TMDB with movie name:', searchParams.movieName);
            movies = await searchMovies({ query: searchParams.movieName });
            console.log('TMDB returned', movies.length, 'movies');
        }
        
        // Step 3: Get details for top movie
        let movieDetails = null;
        if (movies.length > 0) {
            movieDetails = await fetchMovieTrailer(movies[0].id);
        }
        
        res.json({
            prompt,
            aiAnalysis: searchParams,
            tmdbResults: movies.slice(0, 3), // Top 3 results
            topMovieDetails: movieDetails,
            frontendResponse: movies.length > 0 ? {
                ...movies[0],
                ...movieDetails
            } : null
        });
        
    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            message: 'Test failed',
            error: error.message
        });
    }
});

module.exports = router;