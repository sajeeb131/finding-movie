# Comprehensive Search Analysis & Solution

## Problem Analysis

### Current Issue
The simple analyzer incorrectly parses "find 5 brad pitt movies" as:
```json
{
  "movieName": "5 brad pitt",
  "actors": [],
  "genre": [],
  "year": null,
  "keywords": [],
  "mood": null
}
```

### Expected Behavior
Should parse as:
```json
{
  "movieName": null,
  "actors": ["brad pitt"],
  "genre": [],
  "year": null,
  "keywords": [],
  "mood": null,
  "count": 5
}
```

## Comprehensive Search Strategy

### 1. Intent Classification
First, we need to identify what the user wants:
- **Specific Movie**: "find titanic", "the matrix", "avatar"
- **Actor-Based**: "find brad pitt movies", "tom cruise films"
- **Genre-Based**: "find comedy movies", "action films"
- **Count-Based**: "find 5 brad pitt movies", "3 comedy movies"
- **Complex**: "find 5 action movies with tom cruise from the 90s"

### 2. Pattern Recognition
We need to identify these patterns:
- `find {number} {actor} movies` → Actor search with count
- `find {number} {genre} movies` → Genre search with count
- `find {actor} movies` → Actor search
- `find {genre} movies` → Genre search
- `find {movie name}` → Specific movie search

### 3. Search Priority Order
1. **Exact Movie Name Match** (highest priority)
2. **Actor-Based Search** (if actor names found)
3. **Genre-Based Search** (if genres found)
4. **Keyword/Tag Search** (if keywords found)
5. **Mood-Based Search** (if mood identified)
6. **General Search** (fallback)

### 4. Smart Result Combination
Instead of replacing results, we should:
- Prioritize exact movie matches
- Combine actor + genre results with higher weight
- Apply relevance scoring
- Respect count limits

## Implementation Plan

### Phase 1: Enhanced Simple Analyzer
- Better pattern recognition for actor/genre/count
- Improved intent classification
- Proper extraction of count parameter

### Phase 2: Smart Search Controller
- Implement priority-based search
- Combine results from multiple strategies
- Apply relevance scoring
- Respect user-specified count

### Phase 3: Result Optimization
- Remove duplicates intelligently
- Sort by relevance
- Apply count limits
- Enrich with details

## Example Scenarios

### "find 5 brad pitt movies"
1. **Intent**: Actor-based with count
2. **Strategy**: Search for Brad Pitt movies, limit to 5
3. **Expected**: Top 5 Brad Pitt movies by popularity

### "find titanic"
1. **Intent**: Specific movie
2. **Strategy**: Direct movie search
3. **Expected**: 1997 Titanic as top result

### "find funny movies with will smith"
1. **Intent**: Actor + genre combination
2. **Strategy**: Search for Will Smith movies, filter by comedy
3. **Expected**: Will Smith comedy movies

### "find 3 action movies from the 90s"
1. **Intent**: Genre + year + count
2. **Strategy**: Search 90s action movies, limit to 3
3. **Expected**: Top 3 action movies from 1990s

## Technical Implementation

### Enhanced Pattern Matching
```javascript
// Pattern: "find {count} {actor} movies"
const actorCountPattern = /find\s+(\d+)\s+([a-z]+\s+[a-z]+(?:\s+[a-z]+)*)\s+movies/i;

// Pattern: "find {count} {genre} movies"
const genreCountPattern = /find\s+(\d+)\s+([a-z]+)\s+movies/i;

// Pattern: "find {actor} movies"
const actorPattern = /find\s+([a-z]+\s+[a-z]+(?:\s+[a-z]+)*)\s+movies/i;

// Pattern: "find {genre} movies"
const genrePattern = /find\s+([a-z]+)\s+movies/i;
```

### Smart Search Logic
```javascript
// 1. Try exact movie match first
if (movieName && movieName.length > 0) {
    const exactResults = await searchMovies({ query: movieName });
    if (exactResults.length > 0) {
        return prioritizeResults(exactResults, count);
    }
}

// 2. Try actor-based search
if (actors.length > 0) {
    const actorResults = await fetchMoviesForEachActorSeparately(actors);
    if (actorResults.length > 0) {
        return prioritizeResults(actorResults, count);
    }
}

// 3. Try genre-based search
if (genre.length > 0) {
    const genreResults = await searchByGenre(genre);
    if (genreResults.length > 0) {
        return prioritizeResults(genreResults, count);
    }
}
```

This comprehensive approach will handle all types of user queries intelligently and provide the most relevant results.