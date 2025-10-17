# Testing AI Analysis for "Find the titanic movie"

## Option 1: Direct Test Script (Recommended)

Run this command in your terminal from the `server` directory:

```bash
node test-ai-analysis.js
```

This will show you:
1. ✅ What AI extracts from the prompt
2. ✅ What query gets sent to TMDB
3. ✅ What TMDB returns
4. ✅ What the frontend receives

## Option 2: HTTP Test

If you prefer to test via HTTP request:

```bash
curl -X POST http://localhost:4000/api/ai/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Find the titanic movie"}'
```

## What to Look For

### 1. AI Analysis Output
You should see something like:
```json
{
  "movieName": "titanic",
  "actors": [],
  "genre": ["romance", "drama"],
  "year": null,
  "keywords": ["ship", "romantic"],
  "mood": "romantic"
}
```

### 2. TMDB Query
The system should send:
- **Endpoint**: `/search/movie`
- **Parameters**: `{ "query": "titanic" }`

### 3. TMDB Response
You should get multiple Titanic movies, with the 1997 James Cameron version likely first:
- Title: "Titanic"
- Release Date: "1997-12-19"
- ID: 597 (TMDB ID)

### 4. Frontend Response
The final object sent to frontend should include:
- Basic movie info (title, overview, poster)
- Trailer URL (YouTube link)
- Genres (romance, drama)
- Top 12 cast members

## Expected Results

For "Find the titanic movie", you should get:

1. **AI correctly extracts**: movieName = "titanic"
2. **TMDB returns**: Multiple Titanic movies
3. **Top result**: 1997 Titanic with Leonardo DiCaprio and Kate Winslet
4. **Frontend gets**: Complete movie object with trailer and cast

## Troubleshooting

### If AI fails to extract "titanic":
- Check your OpenAI API key in `.env`
- Check internet connection
- Look for error messages in console

### If TMDB returns no results:
- Check TMDB API key
- Verify server is running
- Check network connectivity

### If no trailer found:
- Some movies don't have trailers on YouTube
- This is normal, the system will return `trailerUrl: null`

## Next Steps

After testing "Find the titanic movie", try these additional tests:

1. **Actor search**: `"movies with tom cruise"`
2. **Genre search**: `"funny movies"`
3. **Complex query**: `"action movies with time travel"`
4. **Similarity**: `"movies like the matrix"`

Each test will show you how well the AI understands different types of queries.

## What Makes This Better Than Before

| Query Type | Old System | New AI System |
|------------|------------|----------------|
| "Find the titanic movie" | Basic keyword matching | Understands exact movie name |
| "funny movies with will smith" | Separate searches | Combined search with relevance |
| "movies like titanic" | No similarity understanding | Extracts themes and finds similar |
| "90s action movies" | Limited decade support | Proper temporal filtering |

The AI system should provide much more accurate and relevant results!