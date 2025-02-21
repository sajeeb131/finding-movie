const { GENRES } = require('../utils/constants');
const nlp = require('compromise');
const Fuse = require('fuse.js');
const Cast = require('../models/cast');
const Movie = require('../models/movie');

const fuseOptions = {
    includeScore: true,
    threshold: 0.4,
};

// Detect movie name from the text
const detectMovieName = async (text) => {
    const movies = await Movie.find({}, { title: 1, _id: 0 });
    const movieTitles = movies.map(movie => movie.title);
    const fuse = new Fuse(movieTitles, fuseOptions);
    const result = fuse.search(text);
    return result.length > 0 ? result[0].item : null;
};

// Detect cast from the text
const detectCast = async (text) => {
    const doc = nlp(text);
    const people = doc.people().out('array'); 
    const castMembers = await Cast.find({}, { name: 1, _id: 0 });
    const actorNames = castMembers.map(member => member.name);

    const fuse = new Fuse(actorNames, fuseOptions);
    const detectedActors = people.map(person => {
        const results = fuse.search(person);
        return results.length > 0 ? results[0].item : null;
    });

    return [...new Set(detectedActors.filter(actor => actor !== null))];
};

// Detect genre from the text
// Detect genre from the text (exact match only)
const detectGenre = (text) => {
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\s+/); // Split by whitespace

    // Use Set for efficient lookup
    const genreSet = new Set(GENRES.map(genre => genre.toLowerCase()));
    const detectedGenres = words.filter(word => genreSet.has(word));

    console.log('Words checked for genres:', words);
    console.log('Detected genres:', detectedGenres);

    return [...new Set(detectedGenres)]; // Remove duplicates
};

// Detect logical operator (and/or) in the prompt
const detectLogicalOperator = (text) => {
    if (text.toLowerCase().includes('and')) return 'and';
    if (text.toLowerCase().includes('or')) return 'or';
    return null;
};

// Main function to extract keywords from the prompt
const extractKeywords = async (prompt) => {
    const keywords = {
        movieName: null,
        actorNames: [],
        directorNames: [],
        releaseYear: null,
        genre: [],
        operator: null 
    };

    keywords.movieName = await detectMovieName(prompt);
    keywords.actorNames = await detectCast(prompt);
    const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        keywords.releaseYear = yearMatch[0];
    }
    keywords.genre = detectGenre(prompt);
    keywords.operator = detectLogicalOperator(prompt);
    console.log('Extracted keywords:', keywords);

    return keywords;
};

module.exports = { extractKeywords };