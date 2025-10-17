# Movie Recommendation System - Backend Analysis

## Phase 1: System Architecture Understanding

### Backend Framework & Structure

**Technology Stack:**
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **External API**: TMDB (The Movie Database) API
- **NLP Libraries**: Compromise.js for natural language processing
- **Search**: Fuse.js for fuzzy string matching
- **HTTP Client**: Axios for API requests

**Route/Endpoint Organization:**
- Single main endpoint: `POST /api/search`
- Route structure follows RESTful conventions but is minimal due to focused functionality
- Routes are organized in `/routes/movie-route.js` with controller separation

**Overall Architecture Pattern:**
- **MVC Pattern**: Models, Views (frontend), Controllers
- **Service Layer**: Business logic separated into service modules
- **Repository Pattern**: Database access abstracted through Mongoose models
- **API Gateway Pattern**: Backend acts as a gateway to TMDB API

### Prompt Processing Pipeline

**1. Keyword Extraction (`keyword-service.js`):**
- **Movie Name Detection**: Uses Fuse.js to match against MongoDB movie titles
- **Actor Detection**: Compromise.js NLP for person name extraction + fuzzy matching
- **Genre Detection**: Direct string matching against predefined genre list
- **Tag Detection**: Pattern matching against a comprehensive tag-keyword mapping
- **Year Extraction**: Regex pattern matching for 4-digit years
- **Logical Operator Detection**: Simple string matching for "and"/"or"

**2. NLP Techniques Used:**
- **Named Entity Recognition**: Compromise.js for person identification
- **Pattern Matching**: Custom keyword-to-tag mapping system
- **Fuzzy String Matching**: Fuse.js with configurable threshold (0.4)
- **Tokenization**: Basic whitespace splitting for genre detection

**3. Preprocessing Steps:**
- Text normalization (lowercase conversion)
- Whitespace tokenization
- Special phrase detection for multi-word concepts
- Duplicate removal using Set data structures

### Movie Search & Matching Logic

**Database/API Integration:**
- Primary data source: TMDB API (real-time fetching)
- Local MongoDB for caching movie titles and cast information
- No persistent movie data storage beyond titles and cast names

**Search Query Conversion:**
1. **Priority Order**:
   - Movie name (highest priority)
   - Actor names (separate searches)
   - Tags/keywords
   - Genres
   - Year filters

2. **Query Building**:
   - Movie name → Direct TMDB search query
   - Actors → TMDB person search → movie discovery
   - Tags → TMDB keyword search → movie discovery
   - Genres → TMDB genre ID mapping → discover endpoint

**Matching Algorithm:**
- **Keyword Matching**: Direct string matching for genres
- **Fuzzy Matching**: Fuse.js for movie titles and actor names
- **Semantic Search**: Limited to TMDB's keyword system
- **Multi-factor Search**: Combines different search types based on extracted keywords

**Ranking & Filtering:**
- No custom ranking algorithm - relies on TMDB's default ordering
- Results limited to first 5 items per search type
- Duplicate removal based on movie ID
- No relevance scoring beyond TMDB's internal ranking

### Data Models

**Movie Attributes:**
- **Local MongoDB Model**: Minimal (title only)
- **TMDB Data**: Full movie details including
  - Title, overview, release date
  - Genre classifications
  - Cast information
  - Trailer URLs
  - Rating information
  - Poster images

**Data Structure:**
- **Movies**: Stored as documents in MongoDB (title only)
- **Cast**: Stored with name, TMDB ID, rating, image path
- **Tags**: Mapped through keyword associations in code

### API Integration

**External APIs Used:**
- **TMDB API**: Primary movie data source
  - Search endpoints
  - Discover endpoints
  - Person search
  - Keyword search
  - Movie details (with append_to_response)

**API Call Handling:**
- **Retry Logic**: 3 retries with exponential backoff for network errors
- **Timeout**: 10-second timeout for all requests
- **Error Handling**: Graceful degradation with empty results on failure
- **Rate Limiting**: Not implemented (relies on TMDB's default limits)

## Phase 2: Current Implementation Analysis

### Strengths

1. **Modular Architecture**: Clean separation of concerns with service layers
2. **Robust Error Handling**: Retry logic and graceful failure handling
3. **Flexible Search**: Multiple search strategies (name, actor, genre, tags)
4. **Fuzzy Matching**: Handles typos and variations in movie/actor names
5. **Comprehensive Tag System**: Well-designed keyword-to-tag mapping
6. **Efficient Duplicate Removal**: Prevents repeat results across search types

### Weaknesses & Limitations

1. **Poor Context Understanding**:
   - No semantic relationship between different query components
   - Cannot handle complex queries like "action movie with Tom Cruise from the 90s"
   - No understanding of temporal relationships or context

2. **Limited NLP Capabilities**:
   - Basic tokenization without stemming or lemmatization
   - No intent classification
   - Cannot handle negation or exclusions
   - Poor handling of compound queries

3. **Inadequate Ranking**:
   - No relevance scoring based on query match quality
   - No personalization or user preference learning
   - TMDB's default ranking may not match user intent

4. **Search Strategy Issues**:
   - Fixed priority order doesn't adapt to query type
   - Limited to 5 results per search type
   - No incremental expansion of search criteria

5. **Data Quality Problems**:
   - Minimal local data storage
   - No caching of frequently accessed data
   - Heavy reliance on external API availability

**Specific Query Failure Patterns:**
- "movies like titanic but with robots" - fails to understand similarity
- "funny movies with will smith" - genre and actor combination works but poor ranking
- "something like the matrix" - no similarity matching capability
- "recent sci-fi movies" - no temporal understanding of "recent"

### Technical Debt

1. **Performance Issues**:
   - Multiple sequential API calls per request
   - No caching of TMDB responses
   - Inefficient database queries (full collection scans)

2. **Scalability Concerns**:
   - No rate limiting on API calls
   - No connection pooling for MongoDB
   - No request queuing for high load

3. **Code Quality**:
   - Limited error logging
   - No performance monitoring
   - Minimal input validation
   - Hard-coded constants throughout codebase

4. **Security Issues**:
   - No input sanitization beyond basic checks
   - API key exposed in environment variables
   - No request throttling

## Phase 3: Improvement Recommendations

### Enhanced Prompt Understanding (Priority: High)

**1. Implement Advanced NLP Pipeline**
```javascript
// Example improved extractKeywords function
const extractKeywords = async (prompt) => {
  // 1. Intent classification
  const intent = classifyIntent(prompt);
  
  // 2. Entity extraction with spaCy-like capabilities
  const entities = await extractEntities(prompt);
  
  // 3. Relationship extraction between entities
  const relationships = extractRelationships(prompt);
  
  // 4. Context analysis (temporal, mood, themes)
  const context = analyzeContext(prompt);
  
  return { intent, entities, relationships, context };
};
```

**Implementation Complexity**: High
**Estimated Effort**: 3-4 weeks

**2. Add Intent Classification**
- Use machine learning to identify user intent (search by genre, actor, mood, etc.)
- Implement confidence scoring for different interpretations
- Add handling for comparative queries ("like X but with Y")

**Implementation Complexity**: Medium
**Estimated Effort**: 2 weeks

**3. Implement Semantic Search**
- Integrate with vector embeddings (OpenAI, Cohere, or self-hosted)
- Store movie descriptions as embeddings for similarity matching
- Add semantic similarity scoring for "movies like X" queries

**Implementation Complexity**: High
**Estimated Effort**: 4-5 weeks

### Improved Matching Algorithm (Priority: High)

**1. Multi-Factor Scoring System**
```javascript
const calculateRelevanceScore = (movie, query) => {
  let score = 0;
  
  // Exact title match
  if (exactTitleMatch(movie.title, query.movieName)) score += 100;
  
  // Actor relevance
  score += calculateActorScore(movie.cast, query.actors);
  
  // Genre relevance
  score += calculateGenreScore(movie.genres, query.genres);
  
  // Tag/keyword relevance
  score += calculateTagScore(movie.keywords, query.tags);
  
  // Recency boost
  if (query.timeframe === 'recent') score += recencyBoost(movie.release_date);
  
  return score;
};
```

**Implementation Complexity**: Medium
**Estimated Effort**: 2-3 weeks

**2. Contextual Query Expansion**
- Implement gradual relaxation of search criteria
- Add synonym expansion using word embeddings
- Handle fuzzy temporal queries ("90s movies", "recent films")

**Implementation Complexity**: Medium
**Estimated Effort**: 2 weeks

**3. Personalization Engine**
- Implement user preference learning
- Add collaborative filtering capabilities
- Track user interaction patterns for ranking improvement

**Implementation Complexity**: High
**Estimated Effort**: 4-6 weeks

### System Architecture Improvements (Priority: Medium)

**1. Caching Strategy**
```javascript
// Redis caching example
const getCachedMovies = async (cacheKey) => {
  const cached = await redis.get(cacheKey);
  return cached ? JSON.parse(cached) : null;
};

const cacheMovies = async (cacheKey, movies, ttl = 3600) => {
  await redis.setex(cacheKey, ttl, JSON.stringify(movies));
};
```

**Implementation Complexity**: Low
**Estimated Effort**: 1 week

**2. API Optimization**
- Implement request batching for TMDB calls
- Add connection pooling and keep-alive
- Implement request queuing with backpressure handling

**Implementation Complexity**: Medium
**Estimated Effort**: 2 weeks

**3. Enhanced Error Handling**
- Implement circuit breaker pattern for external APIs
- Add comprehensive logging with structured logs
- Implement health check endpoints

**Implementation Complexity**: Low
**Estimated Effort**: 1 week

### Feature Enhancements (Priority: Medium)

**1. Advanced Query Types**
```javascript
// Handle complex queries like "action movies with Bruce Willis from the 90s"
const handleComplexQuery = async (query) => {
  const { actors, genres, timeframe, mood } = parseComplexQuery(query);
  
  // Build weighted search criteria
  const searchCriteria = {
    actors: { weight: 0.4, values: actors },
    genres: { weight: 0.3, values: genres },
    timeframe: { weight: 0.2, range: timeframe },
    mood: { weight: 0.1, values: mood }
  };
  
  return executeWeightedSearch(searchCriteria);
};
```

**Implementation Complexity**: Medium
**Estimated Effort**: 3 weeks

**2. Hybrid Search Approach**
- Combine traditional keyword search with semantic search
- Implement fallback strategies for failed searches
- Add progressive result loading with infinite scroll

**Implementation Complexity**: Medium
**Estimated Effort**: 2-3 weeks

**3. Real-time Search Suggestions**
- Implement autocomplete for movie titles and actor names
- Add query suggestions based on common patterns
- Implement "did you mean" functionality

**Implementation Complexity**: Low
**Estimated Effort**: 1-2 weeks

## Implementation Priority Matrix

| Feature | Priority | Complexity | Impact | Estimated Effort |
|---------|----------|------------|--------|------------------|
| Multi-factor Scoring | High | Medium | High | 2-3 weeks |
| Advanced NLP Pipeline | High | High | High | 3-4 weeks |
| Caching Strategy | Medium | Low | High | 1 week |
| Intent Classification | High | Medium | Medium | 2 weeks |
| Semantic Search | High | High | High | 4-5 weeks |
| Enhanced Error Handling | Medium | Low | Medium | 1 week |
| API Optimization | Medium | Medium | Medium | 2 weeks |
| Personalization Engine | Medium | High | High | 4-6 weeks |
| Advanced Query Types | Medium | Medium | Medium | 3 weeks |
| Real-time Suggestions | Low | Low | Medium | 1-2 weeks |

## Conclusion

The current implementation provides a solid foundation for a movie recommendation system but lacks the sophisticated NLP capabilities and relevance scoring needed for high-quality user experiences. The most critical improvements needed are:

1. **Enhanced NLP Pipeline**: Better entity extraction and intent understanding
2. **Relevance Scoring**: Multi-factor ranking system for result quality
3. **Semantic Search**: Ability to understand "movies like X" queries
4. **Caching Layer**: Performance optimization and reduced API dependency

The modular architecture of the current system makes it well-positioned for these improvements, with clear separation of concerns allowing for incremental enhancement of individual components.