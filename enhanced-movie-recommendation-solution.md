# Enhanced Movie Recommendation Solution

## Executive Summary

To provide more relevant movie suggestions based on user prompts, I recommend implementing a **Hybrid Semantic-Keyword Matching System** with **Multi-Factor Relevance Scoring**. This solution combines the best of traditional keyword matching with modern NLP techniques while maintaining the existing architecture.

## Core Solution: Enhanced Relevance Scoring System

### 1. Semantic Understanding Module

The key limitation in the current system is its inability to understand semantic relationships and context. Here's the solution:

```javascript
// Enhanced keyword-service.js with semantic understanding
const { extractEntities, analyzeIntent } = require('./nlp-processor');
const { calculateSemanticSimilarity } = require('./semantic-matcher');

const extractKeywords = async (prompt) => {
    // Extract entities using enhanced NLP
    const entities = await extractEntities(prompt);
    
    // Analyze user intent
    const intent = analyzeIntent(prompt);
    
    // Extract traditional keywords
    const traditionalKeywords = await extractTraditionalKeywords(prompt);
    
    // Calculate semantic embeddings for the prompt
    const semanticEmbedding = await generateEmbedding(prompt);
    
    return {
        ...traditionalKeywords,
        entities,
        intent,
        semanticEmbedding,
        contextualFactors: extractContextualFactors(prompt)
    };
};
```

### 2. Multi-Factor Relevance Scoring

Replace the current simple matching with a sophisticated scoring algorithm:

```javascript
// New service: relevance-scoring.js
const calculateRelevanceScore = (movie, query, userHistory = null) => {
    let score = 0;
    const factors = {};
    
    // 1. Exact match factor (highest weight)
    if (query.movieName) {
        factors.exactMatch = calculateExactMatchScore(movie, query.movieName);
        score += factors.exactMatch * 0.3;
    }
    
    // 2. Actor relevance factor
    if (query.actorNames?.length) {
        factors.actorMatch = calculateActorRelevance(movie, query.actorNames);
        score += factors.actorMatch * 0.25;
    }
    
    // 3. Genre relevance factor
    if (query.genre?.length) {
        factors.genreMatch = calculateGenreRelevance(movie, query.genre);
        score += factors.genreMatch * 0.2;
    }
    
    // 4. Semantic similarity factor (for "movies like X" queries)
    if (query.semanticEmbedding) {
        factors.semanticSimilarity = calculateSemanticSimilarity(movie, query.semanticEmbedding);
        score += factors.semanticSimilarity * 0.15;
    }
    
    // 5. Tag/keyword relevance factor
    if (query.tags?.length) {
        factors.tagMatch = calculateTagRelevance(movie, query.tags);
        score += factors.tagMatch * 0.1;
    }
    
    // 6. Contextual factors (recency, popularity, user preferences)
    factors.contextual = calculateContextualScore(movie, query, userHistory);
    score += factors.contextual * 0.1;
    
    return { totalScore: score, factors };
};
```

## Implementation Plan

### Phase 1: Enhanced NLP Processing (Week 1-2)

1. **Implement Advanced Entity Extraction**
   - Use spaCy-like NLP library or OpenAI API for better entity recognition
   - Add context-aware entity disambiguation
   - Implement relationship extraction between entities

2. **Add Intent Classification**
   - Categorize user intents: specific search, genre exploration, mood-based, similar-to
   - Use machine learning model for intent classification
   - Implement confidence scoring for different interpretations

```javascript
// New file: services/nlp-processor.js
const nlp = require('compromise');
const { OpenAI } = require('openai');

const extractEntities = async (text) => {
    // Use compromise for basic entities
    const doc = nlp(text);
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    
    // Use OpenAI for advanced entity extraction
    const advancedEntities = await extractWithOpenAI(text);
    
    return {
        people: [...new Set([...people, ...advancedEntities.people])],
        places: [...new Set([...places, ...advancedEntities.places])],
        movies: advancedEntities.movies,
        temporal: advancedEntities.temporal,
        mood: advancedEntities.mood
    };
};

const analyzeIntent = (text) => {
    const patterns = {
        specific: /^(find|search|show me)\s+.+/i,
        similar: /(like|similar to|movies like)\s+(.+)/i,
        genre: /^(.+)movies$/i,
        mood: /(feel like|in the mood for)\s+(.+)/i,
        actor: /(with|starring)\s+(.+)/i
    };
    
    for (const [intent, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
            return { type: intent, matches: text.match(pattern) };
        }
    }
    
    return { type: 'general', matches: null };
};
```

### Phase 2: Semantic Search Implementation (Week 2-3)

1. **Integrate Vector Embeddings**
   - Use OpenAI's text-embedding-ada-002 or similar
   - Generate embeddings for movie descriptions and overviews
   - Store embeddings in MongoDB or vector database

2. **Implement Semantic Similarity Matching**
   - Add cosine similarity calculation
   - Implement hybrid search combining keyword and semantic matching
   - Add threshold filtering for similarity scores

```javascript
// New file: services/semantic-matcher.js
const { OpenAI } = require('openai');
const cosineSimilarity = require('cosine-similarity');

const generateEmbedding = async (text) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
    });
    return response.data[0].embedding;
};

const calculateSemanticSimilarity = async (movie, queryEmbedding) => {
    if (!movie.embedding) return 0;
    
    const movieEmbedding = movie.embedding;
    const similarity = cosineSimilarity(queryEmbedding, movieEmbedding);
    
    // Normalize to 0-1 scale
    return Math.max(0, similarity);
};
```

### Phase 3: Enhanced Movie Controller (Week 3-4)

Modify the existing controller to use the new scoring system:

```javascript
// Enhanced movie-controller.js
const { extractKeywords } = require('../services/keyword-service');
const { searchMovies, fetchMovieTrailer } = require('../services/tmdb-service');
const { calculateRelevanceScore } = require('../services/relevance-scoring');
const { generateEmbedding } = require('../services/semantic-matcher');

const processPrompt = async (req, res) => {
    const prompt = req.body.prompt;
    
    try {
        // Step 1: Enhanced keyword extraction
        const keywords = await extractKeywords(prompt);
        
        // Step 2: Generate semantic embedding for the prompt
        if (keywords.intent.type === 'similar') {
            keywords.semanticEmbedding = await generateEmbedding(prompt);
        }
        
        // Step 3: Fetch candidate movies using multiple strategies
        const candidateMovies = await fetchCandidateMovies(keywords);
        
        // Step 4: Score and rank movies
        const scoredMovies = await Promise.all(
            candidateMovies.map(async (movie) => {
                const score = await calculateRelevanceScore(movie, keywords);
                return { ...movie, ...score };
            })
        );
        
        // Step 5: Sort by relevance score
        const rankedMovies = scoredMovies
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10); // Return top 10
        
        // Step 6: Enrich with additional details
        const enrichedMovies = await enrichMovieDetails(rankedMovies);
        
        res.status(200).json({ movies: enrichedMovies });
    } catch (error) {
        console.error("Error processing prompt:", error);
        res.status(500).json({
            message: "Failed to process prompt",
            error: error.message
        });
    }
};

const fetchCandidateMovies = async (keywords) => {
    const candidates = new Set();
    
    // Strategy 1: Direct movie search
    if (keywords.movieName) {
        const directResults = await searchMovies({ query: keywords.movieName });
        directResults.forEach(movie => candidates.add(movie));
    }
    
    // Strategy 2: Actor-based search
    if (keywords.actorNames?.length) {
        for (const actor of keywords.actorNames) {
            const actorResults = await searchMovies({ with_cast: actor.id });
            actorResults.forEach(movie => candidates.add(movie));
        }
    }
    
    // Strategy 3: Genre-based search
    if (keywords.genre?.length) {
        const genreResults = await searchMovies({ with_genres: keywords.genre.join(',') });
        genreResults.forEach(movie => candidates.add(movie));
    }
    
    // Strategy 4: Semantic search for "like" queries
    if (keywords.intent.type === 'similar') {
        const semanticResults = await searchMoviesSemantic(keywords.semanticEmbedding);
        semanticResults.forEach(movie => candidates.add(movie));
    }
    
    // Strategy 5: Tag-based search
    if (keywords.tags?.length) {
        const tagResults = await searchByTags(keywords.tags);
        tagResults.forEach(movie => candidates.add(movie));
    }
    
    return Array.from(candidates);
};
```

### Phase 4: Caching and Performance Optimization (Week 4)

1. **Implement Redis Caching**
   - Cache TMDB API responses
   - Cache semantic embeddings
   - Cache search results for common queries

2. **Add Performance Monitoring**
   - Track response times
   - Monitor cache hit rates
   - Log scoring factor effectiveness

```javascript
// New file: services/cache-service.js
const redis = require('redis');
const client = redis.createClient();

const cacheService = {
    async get(key) {
        const cached = await client.get(key);
        return cached ? JSON.parse(cached) : null;
    },
    
    async set(key, value, ttl = 3600) {
        await client.setex(key, ttl, JSON.stringify(value));
    },
    
    async invalidate(pattern) {
        const keys = await client.keys(pattern);
        if (keys.length) {
            await client.del(keys);
        }
    }
};
```

## Expected Improvements

### 1. Better Query Understanding
- **Before**: "movies like titanic" → basic keyword matching
- **After**: "movies like titanic" → semantic similarity based on themes, plot elements, and genre

### 2. Improved Relevance Ranking
- **Before**: Fixed priority order, no relevance scoring
- **After**: Multi-factor scoring with weighted relevance based on query type

### 3. Contextual Understanding
- **Before**: "funny movies with will smith" → separate actor and genre searches
- **After**: "funny movies with will smith" → combined search with relevance boost for comedy + Will Smith

### 4. Handling Complex Queries
- **Before**: "90s action movies with time travel" → fails or poor results
- **After**: "90s action movies with time travel" → multi-factor search with temporal filtering

## Implementation Priority

1. **Immediate (Week 1-2)**: Enhanced NLP processing and intent classification
2. **Short-term (Week 2-3)**: Semantic search implementation
3. **Medium-term (Week 3-4)**: Enhanced scoring system and controller updates
4. **Long-term (Week 4+)**: Caching, performance optimization, and user feedback integration

## Alternative Solutions Considered

### Option 1: Pure Machine Learning Approach
- **Pros**: Highly accurate, learns from user behavior
- **Cons**: Requires large dataset, complex to implement, cold start problem
- **Verdict**: Overkill for current needs, high implementation complexity

### Option 2: External Recommendation API
- **Pros**: Quick implementation, proven results
- **Cons**: Costly, less control, vendor lock-in
- **Verdict**: Good for MVP but not sustainable long-term

### Option 3: Enhanced Keyword Matching Only
- **Pros**: Simple to implement, maintains current architecture
- **Cons**: Limited improvement, still doesn't understand semantics
- **Verdict**: Insufficient for significant improvement

## Recommended Solution: Hybrid Approach

The hybrid semantic-keyword approach provides the best balance of:
- **Implementation feasibility**: Builds on existing architecture
- **Performance improvement**: Significant relevance boost
- **Cost effectiveness**: Uses existing TMDB data with minimal additional costs
- **Scalability**: Can be enhanced with user feedback and machine learning later

This solution will transform the movie recommendation system from a basic keyword matcher to a sophisticated understanding engine that can handle complex user queries with high relevance.