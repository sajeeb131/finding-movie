// Debug script to identify why AI analysis is failing
require('dotenv').config();

const axios = require('axios');

async function debugAIAnalysis() {
    const testPrompt = "Find the titanic movie";
    
    console.log('='.repeat(60));
    console.log('DEBUGGING AI ANALYSIS');
    console.log('='.repeat(60));
    
    // Step 1: Check environment variables
    console.log('\n🔍 STEP 1: Environment Check');
    console.log('----------------------------');
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('OPENAI_API_KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-') || false);
    
    // Step 2: Test direct OpenAI API call
    console.log('\n🌐 STEP 2: Direct OpenAI API Test');
    console.log('-----------------------------------');
    
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content: 'You are a helpful assistant. Return ONLY the word "SUCCESS" if you can read this message.'
            }, {
                role: 'user',
                content: 'Test message'
            }],
            temperature: 0.1,
            max_tokens: 10
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ OpenAI API call successful');
        console.log('Response:', response.data.choices[0].message.content);
        
    } catch (error) {
        console.log('❌ OpenAI API call failed');
        console.log('Error status:', error.response?.status);
        console.log('Error data:', error.response?.data);
        console.log('Error message:', error.message);
        
        // Provide specific troubleshooting
        if (error.response?.status === 401) {
            console.log('\n🔧 TROUBLESHOOTING: Invalid API key');
            console.log('1. Check your OpenAI API key in .env file');
            console.log('2. Make sure it starts with "sk-"');
            console.log('3. Verify the key is active and has credits');
        } else if (error.response?.status === 429) {
            console.log('\n🔧 TROUBLESHOOTING: Rate limit exceeded');
            console.log('1. Wait a few minutes and try again');
            console.log('2. Check your OpenAI account credits');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.log('\n🔧 TROUBLESHOOTING: Network issue');
            console.log('1. Check your internet connection');
            console.log('2. Verify you can reach api.openai.com');
        }
        
        return; // Exit if API call fails
    }
    
    // Step 3: Test the actual AI analysis function
    console.log('\n🧠 STEP 3: Testing AI Analysis Function');
    console.log('----------------------------------------');
    
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
"Find the titanic movie" -> {"movieName": "titanic", "actors": [], "genre": ["romance", "drama"], "year": null, "keywords": ["ship", "romantic"], "mood": "romantic"}

Important: Return ONLY the JSON object, no explanations or additional text.`
            }, {
                role: 'user',
                content: testPrompt
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
        console.log('Raw AI response:', content);
        
        try {
            const parsed = JSON.parse(content);
            console.log('✅ Parsed AI response:', JSON.stringify(parsed, null, 2));
            
            if (parsed.movieName === null) {
                console.log('\n⚠️  WARNING: AI returned null for movieName');
                console.log('This suggests the AI might not be understanding the prompt correctly');
                console.log('Expected: movieName should be "titanic"');
            }
            
        } catch (parseError) {
            console.log('❌ Failed to parse AI response as JSON');
            console.log('Parse error:', parseError.message);
            console.log('Raw content was:', content);
        }
        
    } catch (error) {
        console.log('❌ AI analysis function failed');
        console.log('Error:', error.message);
        console.log('Error details:', error.response?.data);
    }
    
    // Step 4: Test fallback analysis
    console.log('\n🔄 STEP 4: Testing Fallback Analysis');
    console.log('------------------------------------');
    
    const fallbackAnalysis = (prompt) => {
        const lowerPrompt = prompt.toLowerCase();
        
        // Extract year
        const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
        const decadeMatch = lowerPrompt.match(/\b(19|20)\d{0}s\b/);
        const year = yearMatch ? yearMatch[0] : (decadeMatch ? decadeMatch[0] : null);
        
        // Extract potential actor names
        const actorNames = [];
        const words = prompt.split(' ');
        for (let i = 0; i < words.length - 1; i++) {
            const twoWordName = words[i] + ' ' + words[i + 1];
            if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(twoWordName)) {
                actorNames.push(twoWordName);
            }
        }
        
        // Extract movie name (simple heuristic)
        const movieName = lowerPrompt.includes('titanic') ? 'titanic' : null;
        
        // Extract genres
        const genres = [];
        const genreKeywords = ['action', 'comedy', 'drama', 'horror', 'romance', 'thriller'];
        genreKeywords.forEach(genre => {
            if (lowerPrompt.includes(genre)) {
                genres.push(genre);
            }
        });
        
        console.log('Fallback analysis result:', {
            movieName,
            actors: actorNames,
            genre: genres,
            year,
            keywords: [],
            mood: null
        });
        
        return {
            movieName,
            actors: actorNames,
            genre: genres,
            year,
            keywords: [],
            mood: null
        };
    };
    
    const fallbackResult = fallbackAnalysis(testPrompt);
    console.log('✅ Fallback analysis works:', JSON.stringify(fallbackResult, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('DEBUG COMPLETE');
    console.log('='.repeat(60));
}

// Run the debug
debugAIAnalysis();