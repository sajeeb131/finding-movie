// AI-powered text analysis for movie recommendations
// Uses OpenAI GPT-3.5-turbo for natural language understanding
// Falls back to simple rule-based analysis when AI fails

const axios = require('axios');
const { analyzePromptSimple } = require('./simple-analyzer');

/**
 * Analyze user prompt and extract movie search parameters
 * @param {string} prompt - User's movie search prompt
 * @returns {Object} - Structured search parameters
 */
const analyzePrompt = async (prompt) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content: `You are a movie search assistant. Extract search parameters from user prompts and return ONLY valid JSON.

Your response must be valid JSON with these exact fields:
- movieName: string or null (exact movie title if mentioned)
- actors: array of strings (actor names)
- genre: array of strings (movie genres)
- year: string or null (release year or decade)
- keywords: array of strings (thematic keywords)
- mood: string or null (emotional tone like "funny", "scary", "romantic")

Examples:
"funny movies with will smith" -> {"movieName": null, "actors": ["will smith"], "genre": ["comedy"], "year": null, "keywords": ["funny"], "mood": "funny"}
"action movies from the 90s" -> {"movieName": null, "actors": [], "genre": ["action"], "year": "1990s", "keywords": ["90s"], "mood": null}
"movies like titanic" -> {"movieName": null, "actors": [], "genre": ["romance", "drama"], "year": null, "keywords": ["romantic", "disaster", "ship"], "mood": "romantic"}
"tom cruise action movie" -> {"movieName": null, "actors": ["tom cruise"], "genre": ["action"], "year": null, "keywords": [], "mood": null}
"horror movies with ghosts" -> {"movieName": null, "actors": [], "genre": ["horror"], "year": null, "keywords": ["ghosts"], "mood": "scary"}

Important: Return ONLY the JSON object, no explanations or additional text.`
            }, {
                role: 'user',
                content: prompt
            }],
            temperature: 0.1,
            max_tokens: 200
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const content = response.data.choices[0].message.content;
        
        // Parse JSON response
        try {
            const parsed = JSON.parse(content);
            console.log('AI analysis successful:', parsed);
            return parsed;
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            return fallbackAnalysis(prompt);
        }
    } catch (error) {
        console.error('AI analysis failed:', error.message);
        return fallbackAnalysis(prompt);
    }
};

/**
 * Fallback analysis using simple regex and keyword matching
 * @param {string} prompt - User's prompt
 * @returns {Object} - Basic search parameters
 */
const fallbackAnalysis = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract year
    const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
    const decadeMatch = lowerPrompt.match(/\b(19|20)\d{0}s\b/);
    const year = yearMatch ? yearMatch[0] : (decadeMatch ? decadeMatch[0] : null);
    
    // Extract potential actor names (simple heuristic)
    const actorNames = [];
    const words = prompt.split(' ');
    for (let i = 0; i < words.length - 1; i++) {
        const twoWordName = words[i] + ' ' + words[i + 1];
        // Simple check: capitalized words that might be names
        if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(twoWordName)) {
            actorNames.push(twoWordName);
        }
    }
    
    // Extract genres
    const genres = [];
    const genreKeywords = ['action', 'comedy', 'drama', 'horror', 'romance', 'thriller', 'sci-fi', 'fantasy', 'animation'];
    genreKeywords.forEach(genre => {
        if (lowerPrompt.includes(genre)) {
            genres.push(genre);
        }
    });
    
    // Extract mood
    const moodKeywords = {
        'funny': 'funny',
        'scary': 'scary',
        'romantic': 'romantic',
        'sad': 'sad',
        'exciting': 'exciting',
        'thrilling': 'thrilling'
    };
    
    let mood = null;
    for (const [keyword, moodValue] of Object.entries(moodKeywords)) {
        if (lowerPrompt.includes(keyword)) {
            mood = moodValue;
            break;
        }
    }
    
    // Extract keywords from the prompt
    const keywords = [];
    const keywordPatterns = ['like', 'similar', 'with', 'about', 'based on'];
    keywordPatterns.forEach(pattern => {
        if (lowerPrompt.includes(pattern)) {
            keywords.push(pattern);
        }
    });
    
    console.log('Fallback analysis result:', {
        movieName: null,
        actors: actorNames,
        genre: genres,
        year: year,
        keywords: keywords,
        mood: mood
    });
    
    // Use the simple analyzer as a more robust fallback
    console.log('Using simple rule-based analysis as fallback');
    return analyzePromptSimple(prompt);
};

/**
 * Test function to verify AI analysis is working
 * @returns {Object} - Test results
 */
const testAnalysis = async () => {
    const testPrompts = [
        'funny movies with will smith',
        'action movies from the 90s',
        'movies like titanic',
        'tom cruise action movie',
        'horror movies with ghosts'
    ];
    
    console.log('Testing AI analysis...');
    
    for (const prompt of testPrompts) {
        try {
            const result = await analyzePrompt(prompt);
            console.log(`Prompt: "${prompt}"`);
            console.log('Result:', result);
            console.log('---');
        } catch (error) {
            console.error(`Error testing prompt "${prompt}":`, error.message);
        }
    }
};

module.exports = {
    analyzePrompt,
    fallbackAnalysis,
    testAnalysis
};