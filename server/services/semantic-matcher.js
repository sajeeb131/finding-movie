// Simplified semantic matching for movie recommendations
// This implementation uses TF-IDF and cosine similarity for semantic matching
// without requiring external APIs like OpenAI

const natural = require('natural');

// Initialize TF-IDF
const tfidf = new natural.TfIdf();

/**
 * Generate a simple text embedding using TF-IDF
 * @param {string} text - Text to create embedding for
 * @returns {Object} - Embedding object with terms and scores
 */
const generateEmbedding = (text) => {
    if (!text) return null;
    
    // Create a new TF-IDF document
    const documentTfidf = new natural.TfIdf();
    documentTfidf.addDocument(text);
    
    // Get terms and their scores
    const terms = {};
    documentTfidf.listTerms(0).forEach(term => {
        terms[term.term] = term.tfidf;
    });
    
    return {
        terms,
        text: text.toLowerCase()
    };
};

/**
 * Calculate cosine similarity between two embeddings
 * @param {Object} embedding1 - First embedding
 * @param {Object} embedding2 - Second embedding
 * @returns {number} - Similarity score between 0 and 1
 */
const calculateCosineSimilarity = (embedding1, embedding2) => {
    if (!embedding1 || !embedding2) return 0;
    
    const terms1 = embedding1.terms || {};
    const terms2 = embedding2.terms || {};
    
    // Get all unique terms
    const allTerms = new Set([...Object.keys(terms1), ...Object.keys(terms2)]);
    
    // Create vectors
    const vector1 = [];
    const vector2 = [];
    
    allTerms.forEach(term => {
        vector1.push(terms1[term] || 0);
        vector2.push(terms2[term] || 0);
    });
    
    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
    }
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    
    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Calculate semantic similarity between a movie and query embedding
 * @param {Object} movie - Movie object with overview and other text fields
 * @param {Object} queryEmbedding - Query embedding
 * @returns {number} - Similarity score between 0 and 1
 */
const calculateSemanticSimilarity = async (movie, queryEmbedding) => {
    if (!queryEmbedding || !movie) return 0;
    
    // Create movie text from multiple fields
    const movieText = [
        movie.title || '',
        movie.overview || '',
        ...(movie.genres?.map(g => g.name) || []),
        ...(movie.keywords?.results?.map(k => k.name) || [])
    ].join(' ').toLowerCase();
    
    // Generate movie embedding
    const movieEmbedding = generateEmbedding(movieText);
    
    // Calculate similarity
    return calculateCosineSimilarity(movieEmbedding, queryEmbedding);
};

/**
 * Create movie embeddings for a batch of movies
 * @param {Array} movies - Array of movie objects
 * @returns {Array} - Movies with embedded embeddings
 */
const createMovieEmbeddings = (movies) => {
    return movies.map(movie => {
        const movieText = [
            movie.title || '',
            movie.overview || '',
            ...(movie.genres?.map(g => g.name) || []),
            ...(movie.keywords?.results?.map(k => k.name) || [])
        ].join(' ').toLowerCase();
        
        const embedding = generateEmbedding(movieText);
        
        return {
            ...movie,
            embedding
        };
    });
};

/**
 * Find similar movies based on semantic similarity
 * @param {Object} targetMovie - Movie to find similar movies for
 * @param {Array} candidateMovies - Movies to search through
 * @param {number} limit - Maximum number of results
 * @returns {Array} - Similar movies with similarity scores
 */
const findSimilarMovies = (targetMovie, candidateMovies, limit = 10) => {
    if (!targetMovie || !candidateMovies.length) return [];
    
    // Create target embedding if not exists
    const targetEmbedding = targetMovie.embedding || 
        generateEmbedding([
            targetMovie.title || '',
            targetMovie.overview || '',
            ...(targetMovie.genres?.map(g => g.name) || []),
            ...(targetMovie.keywords?.results?.map(k => k.name) || [])
        ].join(' '));
    
    // Calculate similarity for each candidate
    const similarities = candidateMovies.map(movie => {
        const movieEmbedding = movie.embedding || generateEmbedding([
            movie.title || '',
            movie.overview || '',
            ...(movie.genres?.map(g => g.name) || []),
            ...(movie.keywords?.results?.map(k => k.name) || [])
        ].join(' '));
        
        const similarity = calculateCosineSimilarity(targetEmbedding, movieEmbedding);
        
        return {
            ...movie,
            similarityScore: similarity
        };
    });
    
    // Sort by similarity and return top results
    return similarities
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);
};

/**
 * Enhanced keyword extraction with semantic analysis
 * @param {string} text - Text to analyze
 * @returns {Object} - Enhanced keywords with semantic information
 */
const extractSemanticKeywords = (text) => {
    if (!text) return { keywords: [], entities: [], concepts: [] };
    
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // Remove stop words
    const stopWords = natural.stopwords;
    const filteredTokens = tokens.filter(token => !stopWords.includes(token));
    
    // Extract important terms using TF-IDF
    const documentTfidf = new natural.TfIdf();
    documentTfidf.addDocument(text);
    
    const importantTerms = documentTfidf.listTerms(0)
        .filter(term => term.tfidf > 0.1)
        .slice(0, 10)
        .map(term => term.term);
    
    // Extract potential entities (simple heuristic)
    const entities = tokens.filter(token => 
        token.length > 2 && 
        token[0] === token[0].toUpperCase() &&
        !stopWords.includes(token)
    );
    
    // Extract concepts (multi-word phrases)
    const concepts = [];
    for (let i = 0; i < filteredTokens.length - 1; i++) {
        const bigram = `${filteredTokens[i]} ${filteredTokens[i + 1]}`;
        if (text.toLowerCase().includes(bigram)) {
            concepts.push(bigram);
        }
    }
    
    return {
        keywords: importantTerms,
        entities,
        concepts: [...new Set(concepts)]
    };
};

/**
 * Calculate text similarity using multiple methods
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Combined similarity score
 */
const calculateTextSimilarity = (text1, text2) => {
    if (!text1 || !text2) return 0;
    
    // Jaccard similarity
    const tokens1 = new Set(natural.WordTokenizer.tokenize(text1.toLowerCase()));
    const tokens2 = new Set(natural.WordTokenizer.tokenize(text2.toLowerCase()));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // TF-IDF cosine similarity
    const embedding1 = generateEmbedding(text1);
    const embedding2 = generateEmbedding(text2);
    const cosineSimilarity = calculateCosineSimilarity(embedding1, embedding2);
    
    // Combine scores (weighted average)
    return (jaccardSimilarity * 0.4) + (cosineSimilarity * 0.6);
};

module.exports = {
    generateEmbedding,
    calculateCosineSimilarity,
    calculateSemanticSimilarity,
    createMovieEmbeddings,
    findSimilarMovies,
    extractSemanticKeywords,
    calculateTextSimilarity
};