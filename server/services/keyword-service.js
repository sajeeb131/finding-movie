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
    const movies = await Movie.find({}, { title: 1, _id: 0 });
    const movieTitles = movies.flatMap(movie => movie.title);
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
const detectGenre = (text) => {
    const fuse = new Fuse(GENRES, fuseOptions);
    const results = fuse.search(text);
    return results.length > 0 ? results[0].item : null;
};

// Detect logical operator (and/or) in the prompt
const detectLogicalOperator = (text) => {
  if (text.includes('and')) return 'and';
  if (text.includes('or')) return 'or';
  return null; // No logical operator detected
};

// Main function to extract keywords from the prompt
const extractKeywords = async (prompt) => {
    const keywords = {
        movieName: null,
        actorNames: [],
        directorNames: [],
        releaseYear: null,
        genre: null,
        operator: null 
    };

    keywords.movieName = await detectMovieName(prompt);
    keywords.actorNames = await detectCast(prompt);
    const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        keywords.releaseYear = yearMatch[0];
    }
    keywords.genre = detectGenre(prompt);
    return keywords;
};

module.exports = { extractKeywords };