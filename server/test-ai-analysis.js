// Test script to analyze how AI processes prompts and what gets sent to TMDB
require('dotenv').config();

const { analyzePrompt } = require('./services/ai-analyzer');
const { searchMovies, fetchMovieTrailer } = require('./services/tmdb-service');

async function testPromptAnalysis() {
    const testPrompt = "Find the titanic movie";
    
    console.log('='.repeat(50));
    console.log('TESTING PROMPT:', testPrompt);
    console.log('='.repeat(50));
    
    try {
        // Step 1: Analyze the prompt with AI
        console.log('\n🧠 STEP 1: AI Analysis');
        console.log('-------------------');
        const searchParams = await analyzePrompt(testPrompt);
        console.log('AI extracted parameters:', JSON.stringify(searchParams, null, 2));
        
        // Step 2: Show what will be sent to TMDB
        console.log('\n📡 STEP 2: TMDB Query Construction');
        console.log('-----------------------------------');
        
        let tmdbQueries = [];
        
        if (searchParams.movieName) {
            const query = { query: searchParams.movieName };
            tmdbQueries.push({
                type: 'Direct Movie Search',
                endpoint: '/search/movie',
                params: query
            });
            console.log('Direct movie search query:', JSON.stringify(query, null, 2));
        }
        
        if (searchParams.actors && searchParams.actors.length > 0) {
            console.log('Actor searches would be performed for:', searchParams.actors);
        }
        
        if (searchParams.genre && searchParams.genre.length > 0) {
            console.log('Genre searches would be performed for:', searchParams.genre);
        }
        
        if (searchParams.year) {
            console.log('Year filter would be applied:', searchParams.year);
        }
        
        // Step 3: Execute actual TMDB search
        console.log('\n🎬 STEP 3: TMDB API Call');
        console.log('-------------------------');
        
        if (searchParams.movieName) {
            console.log('Calling TMDB with movie name:', searchParams.movieName);
            const movies = await searchMovies({ query: searchParams.movieName });
            console.log(`Found ${movies.length} movies from TMDB`);
            
            if (movies.length > 0) {
                console.log('\nTop 3 results from TMDB:');
                movies.slice(0, 3).forEach((movie, index) => {
                    console.log(`${index + 1}. ${movie.title} (${movie.release_date}) - ID: ${movie.id}`);
                    console.log(`   Overview: ${movie.overview.substring(0, 100)}...`);
                    console.log(`   Popularity: ${movie.popularity}`);
                });
                
                // Step 4: Get details for the top movie
                console.log('\n🎭 STEP 4: Movie Details for Top Result');
                console.log('------------------------------------');
                const topMovie = movies[0];
                const details = await fetchMovieTrailer(topMovie.id);
                
                console.log('Movie details:', JSON.stringify({
                    id: topMovie.id,
                    title: topMovie.title,
                    release_date: topMovie.release_date,
                    overview: topMovie.overview.substring(0, 200) + '...',
                    trailerUrl: details.trailerUrl,
                    genres: details.genres,
                    actors: details.actors.slice(0, 3).map(a => a.name)
                }, null, 2));
                
                // Step 5: Show what frontend receives
                console.log('\n📱 STEP 5: Final Frontend Response');
                console.log('--------------------------------');
                const frontendResponse = {
                    ...topMovie,
                    ...details
                };
                
                console.log('Frontend will receive:', JSON.stringify({
                    movie: {
                        id: frontendResponse.id,
                        title: frontendResponse.title,
                        release_date: frontendResponse.release_date,
                        overview: frontendResponse.overview.substring(0, 150) + '...',
                        poster_path: frontendResponse.poster_path,
                        backdrop_path: frontendResponse.backdrop_path,
                        vote_average: frontendResponse.vote_average,
                        popularity: frontendResponse.popularity,
                        trailerUrl: frontendResponse.trailerUrl,
                        genres: frontendResponse.genres,
                        actors: frontendResponse.actors.map(a => ({
                            id: a.id,
                            name: a.name,
                            profile_path: a.profile_path
                        }))
                    }
                }, null, 2));
                
            } else {
                console.log('No movies found for this query');
            }
        } else {
            console.log('No movie name extracted by AI - this indicates a problem');
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        console.error('Stack trace:', error.stack);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST COMPLETE');
    console.log('='.repeat(50));
}

// Run the test
testPromptAnalysis();