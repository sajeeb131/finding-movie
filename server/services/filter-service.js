// Function to filter movies based on actor logic (and/or)
const filterMoviesByActorLogic = (movies, keywords) => {
    const { operator, actorNames } = keywords;

    if (!actorNames || actorNames.length === 0) return movies;

    // Filter based on logical operator (and/or)
    if (operator === 'and') {
        // Filter movies where all the actors are present
        return movies.filter(movie => {
            const cast = movie.cast || []; // Assuming 'cast' field exists in movie object
            return actorNames.every(actor => cast.includes(actor));
        });
    } else if (operator === 'or') {
        // Filter movies where any of the actors are present
        return movies.filter(movie => {
            const cast = movie.cast || [];
            return actorNames.some(actor => cast.includes(actor));
        });
    } else {
        // If no operator, treat it as 'or' (default behavior)
        return movies.filter(movie => {
            const cast = movie.cast || [];
            return actorNames.some(actor => cast.includes(actor));
        });
    }
};

module.exports = { filterMoviesByActorLogic };