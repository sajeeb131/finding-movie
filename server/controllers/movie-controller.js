const { searchMovies, searchPerson, fetchMoviesForAllActorsTogether, fetchMoviesForEachActorSeparately, fetchMovieTrailer} = require('../services/tmdb-service');
const { extractKeywords } = require('../services/keyword-service');

const processPrompt = async (req, res) => {
    const prompt = req.body.prompt;
    console.log(prompt);
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        // Step 1: Extract keywords from the prompt
        const keywords = await extractKeywords(prompt);
        const queries = {};
        let movies = [];

        // Step 2: Prioritize searching by movie name
        if (keywords.movieName) {
            queries.query = keywords.movieName;
        } else {
            // Step 3: Fetch movies based on actors
            if (keywords.actorNames && keywords.actorNames.length > 0) {
                // Fetch movies using both approaches
                // const moviesTogether = await fetchMoviesForAllActorsTogether(keywords.actorNames);
                const moviesSeparately = await fetchMoviesForEachActorSeparately(keywords.actorNames);
                
                // Combine results without duplicates
                movies = [...new Map([ ...moviesSeparately].map(m => [m.id, m])).values()];
            }

            // // Step 4: Handle director-based search (Convert Name → ID)
            // if (keywords.directorNames && keywords.directorNames.length > 0) {
            //     const director = await searchPerson(keywords.directorNames[0]);
            //     if (director && director.id) {
            //         queries.with_crew = director.id;
            //     }
            // }

            // Step 5: Add other filters if available
            if (keywords.releaseYear) queries.primary_release_year = keywords.releaseYear;
            if (keywords.genre) queries.with_genres = keywords.genre;
        }

        // Step 6: Fetch movies based on other filters
        if (Object.keys(queries).length > 0) {
            const filteredMovies = await searchMovies(queries);
            movies = [...new Map([...movies, ...filteredMovies.slice(0, 5)].map(m => [m.id, m])).values()];
        }
        // Step 7: Fetch trailers for each movie
        for (let i = 0; i < movies.length; i++) {
            const movie = movies[i];
            const trailerUrl = await fetchMovieTrailer(movie.id);
            if (trailerUrl) {
                movies[i] = { ...movie, trailerUrl }; // Add the trailer URL to the movie object
            }
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

