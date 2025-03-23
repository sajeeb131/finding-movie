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
        const queries = {};
        let movies = [];

        // Step 2: Prioritize searching by movie name
        if (keywords.movieName) {
            queries.query = keywords.movieName;
        } else {
            // Step 3: Fetch movies based on actors
            if (keywords.actorNames && keywords.actorNames.length > 0) {
                const moviesSeparately = await fetchMoviesForEachActorSeparately(keywords.actorNames);
                movies = [...new Map([...moviesSeparately].map(m => [m.id, m])).values()];
            }

            // Step 4: Fetch movies based on tags (New Step!)
            if (movies.length === 0 && keywords.tags && keywords.tags.length > 0) {
                console.log('Searching for movies with tags:', keywords.tags);
                const tagMovies = await searchByTags(keywords.tags);
                movies = [...new Map([...tagMovies.slice(0, 5)].map(m => [m.id, m])).values()];
            }

            // Step 5: Fetch movies based on genres if no movie name, actors, or tags found
            if (movies.length === 0 && keywords.genre && keywords.genre.length > 0) {
                const genreMovies = await searchByGenre(keywords.genre);
                movies = [...new Map([...genreMovies.slice(0, 5)].map(m => [m.id, m])).values()];
            }

            // Step 6: Add other filters if available
            if (keywords.releaseYear) queries.primary_release_year = keywords.releaseYear;
        }

        // Step 7: Fetch movies based on other filters
        if (Object.keys(queries).length > 0) {
            const filteredMovies = await searchMovies(queries);
            movies = [...new Map([...movies, ...filteredMovies.slice(0, 5)].map(m => [m.id, m])).values()];
        }

        // Step 8: Fetch trailers, genres, and actors for each movie
        for (let i = 0; i < movies.length; i++) {
            const movie = movies[i];
            const { trailerUrl, genres, actors } = await fetchMovieTrailer(movie.id);
            movies[i] = { ...movie, trailerUrl, genres, actors };
        }

        console.log('Final movies:', movies);
        res.status(200).json({ movies });
    } catch (error) {
        console.error("Error processing prompt:", error);
        res.status(500).json({
            message: "Failed to process prompt",
            error: error.message
        });
    }
};

module.exports = { processPrompt };
