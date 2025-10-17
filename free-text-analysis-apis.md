# Free Text Analysis APIs for Movie Recommendation

## Overview

Here are the best free API options for analyzing user prompts and extracting movie-related parameters that can be directly used with TMDB/IMDb APIs.

## Top Recommendations

### 1. OpenAI GPT API (Free Tier)
**Best for: Comprehensive understanding and structured extraction**

- **Free Tier**: $5 credit for new users (approximately 1M tokens)
- **API Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Why it's great**: Excellent at understanding complex movie queries and extracting structured data

```javascript
const analyzePrompt = async (prompt) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system',
                content: `Extract movie search parameters from the user's prompt. Return JSON with:
                - movieName: exact movie title if mentioned
                - actors: array of actor names
                - genre: array of genres
                - year: release year if mentioned
                - keywords: thematic keywords
                - mood: emotional tone (e.g., "funny", "scary", "romantic")
                
                Examples:
                "funny movies with will smith" -> {"actors": ["will smith"], "mood": "funny"}
                "action movies from the 90s" -> {"genre": ["action"], "year": "1990s"}
                "movies like titanic" -> {"keywords": ["romance", "disaster", "historical"]}`
            }, {
                role: 'user',
                content: prompt
            }],
            temperature: 0.1,
            max_tokens: 150
        })
    });
    
    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
};
```

**Pros:**
- Excellent understanding of natural language
- Handles complex queries like "movies like titanic but with more action"
- Provides structured JSON output
- Good for "similarity" queries

**Cons:**
- Limited free tier
- Requires API key setup

### 2. Google Cloud Natural Language API (Free Tier)
**Best for: Entity extraction and sentiment analysis**

- **Free Tier**: 5,000 units/month (1 unit = 1,000 characters)
- **API Endpoint**: `https://language.googleapis.com/v1/documents:analyzeEntities`
- **Why it's great**: Excellent at identifying people, places, and themes

```javascript
const analyzeWithGoogle = async (prompt) => {
    const response = await fetch(`https://language.googleapis.com/v1/documents:analyzeEntities?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            document: {
                type: 'PLAIN_TEXT',
                content: prompt
            },
            encodingType: 'UTF8'
        })
    });
    
    const result = await response.json();
    
    // Extract entities and classify them
    const entities = result.entities || [];
    const actors = entities.filter(e => e.type === 'PERSON').map(e => e.name);
    const keywords = entities.filter(e => e.type === 'EVENT' || e.type === 'OTHER').map(e => e.name);
    
    return { actors, keywords };
};
```

**Pros:**
- Good at identifying actors and themes
- Reliable and well-documented
- Decent free tier

**Cons:**
- Less flexible than OpenAI for complex queries
- Requires more post-processing

### 3. Microsoft Azure Text Analytics (Free Tier)
**Best for: Key phrase extraction and language understanding**

- **Free Tier**: 5,000 transactions/month
- **API Endpoint**: `https://<region>.api.cognitive.microsoft.com/text/analytics/v3.0/keyPhrases`
- **Why it's great**: Simple key phrase extraction

```javascript
const analyzeWithAzure = async (prompt) => {
    const response = await fetch('https://eastus.api.cognitive.microsoft.com/text/analytics/v3.0/keyPhrases', {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            documents: [{
                id: '1',
                language: 'en',
                text: prompt
            }]
        })
    });
    
    const result = await response.json();
    const keyPhrases = result.documents[0].keyPhrases;
    
    // Classify key phrases into categories
    const actors = keyPhrases.filter(phrase => 
        // Simple heuristic for actor names
        /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(phrase)
    );
    
    const genres = keyPhrases.filter(phrase => 
        ['action', 'comedy', 'drama', 'horror', 'romance'].includes(phrase.toLowerCase())
    );
    
    return { actors, genres, keywords: keyPhrases };
};
```

**Pros:**
- Simple to implement
- Good for basic keyword extraction
- Reliable performance

**Cons:**
- Limited understanding of context
- Requires manual classification of results

### 4. Hugging Face Inference API (Free)
**Best for: Advanced NLP models without hosting**

- **Free Tier**: 30,000 requests/month
- **API Endpoint**: `https://api-inference.huggingface.co/models/facebook/bart-large-mnli`
- **Why it's great**: Zero-shot classification for intent understanding

```javascript
const analyzeWithHuggingFace = async (prompt) => {
    // Zero-shot classification for intents
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-mnli', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                candidate_labels: [
                    'search by actor',
                    'search by genre',
                    'search by mood',
                    'search by year',
                    'search by similarity',
                    'general search'
                ]
            }
        })
    });
    
    const result = await response.json();
    const intent = result.labels[0];
    const score = result.scores[0];
    
    // Extract entities based on intent
    const entities = await extractEntitiesByIntent(prompt, intent);
    
    return { intent, confidence: score, ...entities };
};
```

**Pros:**
- Access to state-of-the-art models
- Good for intent classification
- Free tier is generous

**Cons:**
- Can be slower than other options
- Limited fine-tuning options

### 5. MonkeyLearn API (Free Tier)
**Best for: Topic and keyword extraction**

- **Free Tier**: 300 queries/month
- **API Endpoint**: `https://api.monkeylearn.com/v3/extractors/ex_YCya9nrn/extract/`
- **Why it's great**: Pre-trained models for movie-related text

```javascript
const analyzeWithMonkeyLearn = async (prompt) => {
    const response = await fetch('https://api.monkeylearn.com/v3/extractors/ex_YCya9nrn/extract/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${process.env.MONKEYLEARN_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: [prompt]
        })
    });
    
    const result = await response.json();
    const extractions = result[0].extractions;
    
    // Classify extractions
    const movieParams = {
        actors: [],
        genres: [],
        keywords: [],
        year: null
    };
    
    extractions.forEach(extraction => {
        const text = extraction.extracted_text;
        const tag = extraction.tag_name;
        
        if (tag === 'person') movieParams.actors.push(text);
        else if (tag === 'genre') movieParams.genres.push(text);
        else if (tag === 'year') movieParams.year = text;
        else movieParams.keywords.push(text);
    });
    
    return movieParams;
};
```

**Pros:**
- Specialized in entity extraction
- Good accuracy for movie-related terms
- Easy to understand results

**Cons:**
- Limited free tier
- Less flexible for complex queries

## Recommended Implementation Strategy

### Phase 1: Quick Win with OpenAI GPT
Start with OpenAI GPT-3.5-turbo for the best results:

```javascript
// server/services/ai-analyzer.js
const analyzePrompt = async (prompt) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'system',
                    content: `You are a movie search assistant. Extract search parameters from user prompts. 
                    Return ONLY valid JSON with these fields:
                    - movieName: string or null
                    - actors: array of strings
                    - genre: array of strings
                    - year: string or null
                    - keywords: array of strings
                    - mood: string or null
                    
                    Examples:
                    "funny movies with will smith" -> {"movieName": null, "actors": ["will smith"], "genre": ["comedy"], "year": null, "keywords": ["funny"], "mood": "funny"}
                    "action movies from the 90s" -> {"movieName": null, "actors": [], "genre": ["action"], "year": "1990s", "keywords": ["90s"], "mood": null}
                    "movies like titanic" -> {"movieName": null, "actors": [], "genre": ["romance", "drama"], "year": null, "keywords": ["romantic", "disaster", "ship"], "mood": "romantic"}`
                }, {
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.1,
                max_tokens: 200
            })
        });
        
        const result = await response.json();
        const content = result.choices[0].message.content;
        
        // Parse JSON response
        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            return fallbackAnalysis(prompt);
        }
    } catch (error) {
        console.error('AI analysis failed:', error);
        return fallbackAnalysis(prompt);
    }
};

// Fallback to simple keyword extraction
const fallbackAnalysis = (prompt) => {
    // Simple regex-based extraction as fallback
    const yearMatch = prompt.match(/\b(19|20)\d{2}\b/);
    const actors = prompt.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
    
    return {
        movieName: null,
        actors: actors,
        genre: [],
        year: yearMatch ? yearMatch[0] : null,
        keywords: [],
        mood: null
    };
};

module.exports = { analyzePrompt };
```

### Phase 2: Integration with TMDB

```javascript
// Enhanced movie controller using AI analysis
const { analyzePrompt } = require('../services/ai-analyzer');
const { searchMovies, searchPerson, fetchMoviesForEachActorSeparately } = require('../services/tmdb-service');

const processPrompt = async (req, res) => {
    const prompt = req.body.prompt;
    
    try {
        // Step 1: Analyze prompt with AI
        const searchParams = await analyzePrompt(prompt);
        console.log('AI extracted parameters:', searchParams);
        
        // Step 2: Build TMDB queries based on AI results
        let movies = [];
        
        if (searchParams.movieName) {
            // Direct movie search
            movies = await searchMovies({ query: searchParams.movieName });
        } else {
            // Multi-strategy search
            const searchPromises = [];
            
            // Actor-based search
            if (searchParams.actors.length > 0) {
                searchPromises.push(fetchMoviesForEachActorSeparately(searchParams.actors));
            }
            
            // Genre-based search
            if (searchParams.genre.length > 0) {
                const genreIds = searchParams.genre.map(g => getGenreId(g));
                searchPromises.push(searchMovies({ with_genres: genreIds.join(',') }));
            }
            
            // Year-based search
            if (searchParams.year) {
                const yearFilter = parseYear(searchParams.year);
                searchPromises.push(searchMovies({ primary_release_year: yearFilter }));
            }
            
            // Execute all searches
            const results = await Promise.all(searchPromises);
            movies = results.flat();
        }
        
        // Step 3: Remove duplicates and return top results
        const uniqueMovies = [...new Map(movies.map(m => [m.id, m])).values()];
        const topMovies = uniqueMovies.slice(0, 8);
        
        // Step 4: Fetch additional details
        const enrichedMovies = await Promise.all(
            topMovies.map(async (movie) => {
                const details = await fetchMovieTrailer(movie.id);
                return { ...movie, ...details };
            })
        );
        
        res.status(200).json({ movies: enrichedMovies });
    } catch (error) {
        console.error("Error processing prompt:", error);
        res.status(500).json({
            message: "Failed to process prompt",
            error: error.message
        });
    }
};
```

## Cost Comparison

| Service | Free Tier | Cost After | Best For |
|---------|-----------|------------|-----------|
| OpenAI GPT | $5 credit (~1M tokens) | $0.002/1K tokens | Complex queries |
| Google NLP | 5K units/month | $1/1K units | Entity extraction |
| Azure Text Analytics | 5K transactions/month | $2.50/1K transactions | Key phrases |
| Hugging Face | 30K requests/month | $0.10/hour | Advanced models |
| MonkeyLearn | 300 queries/month | $299/month | Specialized extraction |

## My Recommendation

**Start with OpenAI GPT-3.5-turbo** because:

1. **Best understanding** of natural language queries
2. **Structured JSON output** that's easy to work with
3. **Handles complex queries** like "movies like X but with Y"
4. **Reasonable free tier** for testing and development
5. **Simple implementation** with minimal post-processing

The $5 free credit should be sufficient for development and initial testing. Once you see good results, you can optimize or switch to a more cost-effective solution if needed.

## Setup Instructions

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/
   - Sign up and get $5 free credit
   - Create an API key

2. **Add to .env file**:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Install axios** (if not already installed):
   ```bash
   npm install axios
   ```

4. **Implement the AI analyzer service** as shown above

This approach will give you the best results with minimal complexity and cost for development.