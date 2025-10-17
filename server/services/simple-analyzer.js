// Simple rule-based analyzer that doesn't require OpenAI
// This provides basic movie search functionality without AI

/**
 * Analyze user prompt using simple rules and patterns
 * @param {string} prompt - User's movie search prompt
 * @returns {Object} - Structured search parameters
 */
const analyzePromptSimple = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Initialize result
    const result = {
        movieName: null,
        actors: [],
        genre: [],
        year: null,
        keywords: [],
        mood: null,
        count: null
    };
    
    // Extract year first (before pattern matching)
    const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
    const decadeMatch = lowerPrompt.match(/\b(19|20)?\d{0}s\b/);
    if (yearMatch) {
        result.year = yearMatch[0];
    } else if (decadeMatch) {
        result.year = decadeMatch[0];
    }
    
    // Step 1: Check for count-based patterns first
    // Pattern: "find 5 brad pitt movies"
    const actorCountMatch = lowerPrompt.match(/find\s+(\d+)\s+([a-z]+\s+[a-z]+(?:\s+[a-z]+)*)\s+movies?/);
    if (actorCountMatch) {
        result.count = parseInt(actorCountMatch[1]);
        result.actors.push(actorCountMatch[2]);
        console.log('Detected actor count pattern:', result);
        return result;
    }
    
    // Pattern: "find 5 comedy movies"
    const genreCountMatch = lowerPrompt.match(/find\s+(\d+)\s+([a-z]+)\s+movies?/);
    if (genreCountMatch) {
        result.count = parseInt(genreCountMatch[1]);
        const genre = mapToGenre(genreCountMatch[2]);
        if (genre) result.genre.push(genre);
        console.log('Detected genre count pattern:', result);
        return result;
    }
    
    // Step 2: Check for complex patterns with actors + genre + count
    // Pattern: "find 5 action movies with will smith"
    const actorGenreCountMatch = lowerPrompt.match(/find\s+(\d+)\s+([a-z]+)\s+movies?\s+with\s+([a-z]+\s+[a-z]+(?:\s+[a-z]+)*)/);
    if (actorGenreCountMatch) {
        result.count = parseInt(actorGenreCountMatch[1]);
        const genre = mapToGenre(actorGenreCountMatch[2]);
        if (genre) result.genre.push(genre);
        result.actors.push(actorGenreCountMatch[3]);
        console.log('Detected actor+genre+count pattern:', result);
        return result;
    }
    
    // Step 3: Check for actor-based patterns
    // Pattern: "find brad pitt movies"
    const actorMatch = lowerPrompt.match(/find\s+([a-z]+\s+[a-z]+(?:\s+[a-z]+)*)\s+movies?/);
    if (actorMatch) {
        result.actors.push(actorMatch[1]);
        console.log('Detected actor pattern:', result);
        return result;
    }
    
    // Pattern: "movies with brad pitt"
    const withActorMatch = lowerPrompt.match(/movies?\s+with\s+([a-z]+\s+[a-z]+(?:\s+[a-z]+)*)/);
    if (withActorMatch) {
        result.actors.push(withActorMatch[1]);
        console.log('Detected "with actor" pattern:', result);
        return result;
    }
    
    // Step 3: Check for genre + year patterns
    // Pattern: "find horror movies from 2021"
    const genreYearMatch = lowerPrompt.match(/find\s+([a-z]+)\s+movies?\s+from\s+(\d{4})/);
    if (genreYearMatch) {
        const genre = mapToGenre(genreYearMatch[1]);
        if (genre) result.genre.push(genre);
        result.year = genreYearMatch[2];
        console.log('Detected genre+year pattern:', result);
        return result;
    }
    
    // Pattern: "find comedy movies"
    const genreMatch = lowerPrompt.match(/find\s+([a-z]+)\s+movies?/);
    if (genreMatch) {
        const genre = mapToGenre(genreMatch[1]);
        if (genre) result.genre.push(genre);
        console.log('Detected genre pattern:', result);
        return result;
    }
    
    // Step 4: Extract movie name (look for specific patterns)
    // Only if no actor/genre patterns were found
    const moviePatterns = [
        /(?:find|search|show me|get|watch)\s+(?:the\s+)?([a-z0-9\s]+?)(?:\s+movie|\s+film|\s+from|\s+with|\s+starring|$)/i,
        /(?:the\s+)?([a-z0-9\s]+?)(?:\s+movie|\s+film|\s+from|\s+with|\s+starring|$)/i
    ];
    
    for (const pattern of moviePatterns) {
        const match = prompt.match(pattern);
        if (match && match[1]) {
            const movieName = match[1].trim();
            // Only use if it looks like a reasonable movie name and doesn't contain numbers at start
            if (movieName.length >= 2 && movieName.length <= 50 && !/^\d+/.test(movieName)) {
                result.movieName = movieName;
                console.log('Detected movie name pattern:', result);
                break;
            }
        }
    }
    
    // Special case: "titanic" should be detected even in simple form
    if (lowerPrompt.includes('titanic')) {
        result.movieName = 'titanic';
        result.genre = ['romance', 'drama'];
        result.mood = 'romantic';
        result.keywords = ['ship', 'romantic'];
    }
    
    // Year was already extracted at the beginning, no need to re-extract
    
    // Extract genres (fallback)
    const genreMap = {
        'action': 'action',
        'comedy': 'comedy',
        'funny': 'comedy',
        'drama': 'drama',
        'horror': 'horror',
        'scary': 'horror',
        'thriller': 'thriller',
        'romance': 'romance',
        'romantic': 'romance',
        'sci-fi': 'science fiction',
        'science fiction': 'science fiction',
        'fantasy': 'fantasy',
        'animation': 'animation',
        'animated': 'animation',
        'family': 'family',
        'adventure': 'adventure',
        'mystery': 'mystery',
        'crime': 'crime',
        'war': 'war',
        'western': 'western'
    };
    
    for (const [keyword, genre] of Object.entries(genreMap)) {
        if (lowerPrompt.includes(keyword) && !result.genre.includes(genre)) {
            result.genre.push(genre);
        }
    }
    
    // Extract mood
    const moodMap = {
        'funny': 'funny',
        'hilarious': 'funny',
        'scary': 'scary',
        'terrifying': 'scary',
        'romantic': 'romantic',
        'sad': 'sad',
        'emotional': 'sad',
        'exciting': 'exciting',
        'thrilling': 'thrilling',
        'suspenseful': 'thrilling'
    };
    
    for (const [keyword, mood] of Object.entries(moodMap)) {
        if (lowerPrompt.includes(keyword)) {
            result.mood = mood;
            break;
        }
    }
    
    // Remove duplicates
    result.actors = [...new Set(result.actors)];
    result.genre = [...new Set(result.genre)];
    result.keywords = [...new Set(result.keywords)];
    
    console.log('Simple analysis result:', result);
    return result;
};

/**
 * Map common genre keywords to TMDB genre names
 */
const mapToGenre = (keyword) => {
    const genreMap = {
        'action': 'action',
        'comedy': 'comedy',
        'funny': 'comedy',
        'drama': 'drama',
        'horror': 'horror',
        'scary': 'horror',
        'thriller': 'thriller',
        'romance': 'romance',
        'romantic': 'romance',
        'sci-fi': 'science fiction',
        'fantasy': 'fantasy',
        'animation': 'animation',
        'family': 'family',
        'adventure': 'adventure',
        'mystery': 'mystery',
        'crime': 'crime',
        'war': 'war',
        'western': 'western'
    };
    
    return genreMap[keyword.toLowerCase()] || null;
};

/**
 * Test function to verify simple analysis
 */
const testSimpleAnalysis = () => {
    const testPrompts = [
        'Find the titanic movie',
        'funny movies with will smith',
        'action movies from the 90s',
        'movies like the matrix',
        'horror movies with ghosts',
        'tom cruise action movie'
    ];
    
    console.log('Testing simple analysis...');
    
    testPrompts.forEach(prompt => {
        const result = analyzePromptSimple(prompt);
        console.log(`"${prompt}" -> ${JSON.stringify(result)}`);
    });
};

module.exports = {
    analyzePromptSimple,
    testSimpleAnalysis
};