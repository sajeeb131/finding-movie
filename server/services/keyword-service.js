// services/keyword-service.js - Updated version with tag detection

const { GENRES } = require('../utils/constants');
const { TAG_KEYWORD_MAP } = require('../utils/movie-tags');  // Import our new tag mapping
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

// NEW FUNCTION: Detect tags from the text
const detectTags = (text) => {
    const normalizedText = text.toLowerCase();
    const detectedTags = new Set();
    
    // Try to match phrases first (for multi-word tags)
    for (const [keyword, tag] of TAG_KEYWORD_MAP.entries()) {
        if (keyword.includes(' ') && normalizedText.includes(keyword)) {
            detectedTags.add(tag);
        }
    }
    
    // Then check individual words for single-word matches
    const words = normalizedText.split(/\s+/);
    for (const word of words) {
        if (TAG_KEYWORD_MAP.has(word)) {
            detectedTags.add(TAG_KEYWORD_MAP.get(word));
        }
    }
    
    // Special case handling for common phrases in user queries
    const phraseMatches = {
        'about aliens': 'aliens',
        'with aliens': 'aliens',
        'about zombies': 'zombies',
        'with zombies': 'zombies',
        'about magic': 'magic',
        'about time travel': 'time travel',
        'with superheroes': 'superheroes',
        'about dragons': 'dragons',
        'about vampires': 'vampires',
        'about pirates': 'pirates',
        'about detectives': 'detectives',
        'about spies': 'spies'
    };
    
    for (const [phrase, tag] of Object.entries(phraseMatches)) {
        if (normalizedText.includes(phrase)) {
            detectedTags.add(tag);
        }
    }
    
    console.log('Detected tags:', [...detectedTags]);
    return [...detectedTags];
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
        tags: [],  // New field for tags
        operator: null 
    };

    keywords.movieName = await detectMovieName(prompt);
    keywords.actorNames = await detectCast(prompt);
    const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        keywords.releaseYear = yearMatch[0];
    }
    keywords.genre = detectGenre(prompt);
    keywords.tags = detectTags(prompt);  // Add tag detection
    keywords.operator = detectLogicalOperator(prompt);
    
    console.log('Extracted keywords:', keywords);
    return keywords;
};

module.exports = { extractKeywords };