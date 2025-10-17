# AI-Powered Movie Recommendation Setup Guide

## Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
cd server
npm install axios
```

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with "sk-...")

### 3. Add API Key to Environment

Add this line to your `server/.env` file:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start the Server

```bash
cd server
npm start
```

### 5. Test the AI Analysis

```bash
# Test AI analysis
curl http://localhost:4000/api/ai/test

# Test with a movie prompt
curl -X POST http://localhost:4000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"prompt": "funny movies with will smith"}'
```

## How to Use in Your Frontend

Update your frontend API calls to use the new AI endpoint:

```javascript
// Instead of: /api/search
// Use: /api/ai/search

const response = await fetch('/api/ai/search', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        prompt: userPrompt
    })
});

const data = await response.json();
const movies = data.movies;
```

## What the AI Can Understand

The AI can extract these types of information from user prompts:

### ✅ Movie Names
- "find the movie titanic"
- "search for the matrix"

### ✅ Actors
- "movies with tom cruise"
- "films starring will smith"

### ✅ Genres
- "action movies"
- "funny movies"
- "horror films"

### ✅ Time Periods
- "movies from the 90s"
- "films from 2020"
- "80s action movies"

### ✅ Moods/Themes
- "scary movies"
- "romantic films"
- "exciting action movies"

### ✅ Similarity Queries
- "movies like titanic"
- "something similar to the matrix"

### ✅ Complex Combinations
- "funny movies with will smith from the 90s"
- "scary movies with ghosts"
- "action movies with time travel"

## Example Queries to Test

Try these queries to see how well the AI works:

1. **Simple Actor Search**: "movies with leonardo dicaprio"
2. **Genre + Actor**: "comedy movies with adam sandler"
3. **Time Period**: "action movies from the 80s"
4. **Mood**: "scary movies with ghosts"
5. **Similarity**: "movies like star wars"
6. **Complex**: "funny movies with eddie murphy from the 90s"

## Troubleshooting

### Issue: "OPENAI_API_KEY not found"
**Solution**: Make sure you added the API key to your `.env` file and restarted the server.

### Issue: "Invalid API key"
**Solution**: Double-check your OpenAI API key and make sure it's correct.

### Issue: "API rate limit exceeded"
**Solution**: The free tier has limits. Wait a bit and try again.

### Issue: "No movies found"
**Solution**: The AI might have misunderstood the query. Check the server logs to see what parameters were extracted.

### Issue: "Fallback analysis used"
**Solution**: The OpenAI API call failed. Check your internet connection and API key.

## Monitoring

Check the server console to see:
- What parameters the AI extracted from the prompt
- How many movies were found
- Any errors that occurred

## Cost

The OpenAI free tier includes $5 credit, which is enough for:
- Approximately 1,000 movie searches
- Or 500,000 tokens of text processing

This should be plenty for development and testing.

## Next Steps

Once you confirm the AI is working well:

1. Update your frontend to use the `/api/ai/search` endpoint
2. Remove the old keyword extraction logic if no longer needed
3. Monitor usage and costs
4. Consider adding user feedback to improve recommendations

## Support

If you encounter issues:

1. Check the server console for detailed error messages
2. Verify your OpenAI API key is correct
3. Make sure you have internet connection
4. Test with simple prompts first

The AI should provide much better movie suggestions than the previous keyword-based system!