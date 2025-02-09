const { GENRES } = require('../utils/constants');
const nlp = require('compromise');
const Fuse = require('fuse.js');
const Cast = require('../models/cast'); // Import the Cast model
const Movie = require('../models/movie'); // Import the Movie model

const fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: ['name']
};

// Detect movie name from the text (using database for accurate results)
const detectMovieName = async (text) => {
    // Fetch all movie titles from the Movie collection
    const movies = await Movie.find({}, { title: 1, _id: 0 });
    const movieTitles = movies.flatMap(movie => movie.title); // Flatten to get a single array of movie titles
    // Use fuzzy matching to find the most likely movie name from the list
    const fuse = new Fuse(movieTitles, fuseOptions);
    const result = fuse.search(text);

    // Return the first match if any
    return result.length > 0 ? result[0].item : null;
};


// Detect cast from the text
const detectCast = async (text) => {
    const doc = nlp(text);
    const people = doc.people().out('array'); // Extract people

    // Fetch all actor names from the Cast collection
    const castMembers = await Cast.find({}, { name: 1, _id: 0 });
    const actorNames = castMembers.map((member) => member.name);

    // Use fuzzy matching to find the most likely cast member
    const fuse = new Fuse(actorNames, fuseOptions);
    const detectedActors = people.map((person) => {
        const results = fuse.search(person);
        return results.length > 0 ? results[0].item : null;
    });

    return [...new Set(detectedActors.filter((actor) => actor !== null))];
};

// Detect genre from the text
const detectGenre = (text) => {
    const fuse = new Fuse(GENRES, fuseOptions);
    const results = fuse.search(text);

    return results.length > 0 ? results[0].item : null;
};

// Main function to extract keywords from the prompt
const extractKeywords = async (prompt) => {
    const keywords = {
        movieName: null,
        actorNames: [],
        directorNames: [], // You can add logic for director extraction here
        releaseYear: null,
        genre: null
    };

    // Step 1: Detect movie name
    keywords.movieName = await detectMovieName(prompt);

    // Step 2: Detect cast members
    keywords.actorNames = await detectCast(prompt);

    // Step 3: Detect release year
    const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        keywords.releaseYear = yearMatch[0];
    }

    // Step 4: Detect genre
    keywords.genre = detectGenre(prompt);

    console.log('Extracted Keywords:', keywords);
    return keywords;
};

module.exports = { extractKeywords };

