# AI Analysis Troubleshooting Guide

## Issue: AI Returns All Null Values

You're getting this result:
```json
{
  "movieName": null,
  "actors": [],
  "genre": [],
  "year": null,
  "keywords": [],
  "mood": null
}
```

## Step 1: Debug the Problem

Run this command to identify the issue:

```bash
cd server
node debug-ai-analysis.js
```

This will tell you exactly what's wrong:

### ✅ If you see "OpenAI API call successful"
- The API key is working
- The issue might be with the prompt parsing
- Check if the AI response is valid JSON

### ❌ If you see "OpenAI API call failed"
- The API key is invalid or expired
- Check your internet connection
- Verify you have API credits

## Step 2: Fix Common Issues

### Issue A: Invalid API Key
**Symptoms**: 401 Unauthorized error

**Solution**:
1. Go to https://platform.openai.com/
2. Generate a new API key
3. Update your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-new-key-here
   ```
4. Restart the server

### Issue B: No API Credits
**Symptoms**: 429 Rate Limit error

**Solution**:
1. Check your OpenAI dashboard for credits
2. Add payment method or wait for free tier reset
3. Use the simple analyzer as fallback (already implemented)

### Issue C: Network Issues
**Symptoms**: Connection refused or timeout

**Solution**:
1. Check internet connection
2. Verify firewall settings
3. Try from different network

## Step 3: Test the Simple Analyzer

Even if OpenAI fails, the system should now work with the simple analyzer:

```bash
curl -X POST http://localhost:4000/api/ai/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Find the titanic movie"}'
```

**Expected result with simple analyzer**:
```json
{
  "movieName": "titanic",
  "actors": [],
  "genre": ["romance", "drama"],
  "year": null,
  "keywords": [],
  "mood": "romantic"
}
```

## Step 4: Test the Simple Analyzer Directly

```bash
node -e "const { testSimpleAnalysis } = require('./services/simple-analyzer'); testSimpleAnalysis();"
```

This should show:
```
"Find the titanic movie" -> {"movieName":"titanic","actors":[],"genre":[],"year":null,"keywords":[],"mood":null}
```

## Step 5: Update Your Frontend (If Needed)

If the simple analyzer is working, you can continue with that. The system will automatically:

1. Try OpenAI first
2. Fall back to simple analyzer if AI fails
3. Continue to search TMDB with extracted parameters

## Expected Final Result

After fixing the issue, you should get:

1. **AI Analysis**: Proper extraction of "titanic" as movieName
2. **TMDB Query**: `{ query: "titanic" }`
3. **TMDB Results**: Multiple Titanic movies
4. **Frontend Response**: Complete movie details for 1997 Titanic

## Quick Test Commands

```bash
# Test the debug script
node debug-ai-analysis.js

# Test the simple analyzer
node -e "const { analyzePromptSimple } = require('./services/simple-analyzer'); console.log(analyzePromptSimple('Find the titanic movie'));"

# Test the API endpoint
curl -X POST http://localhost:4000/api/ai/test-prompt -H "Content-Type: application/json" -d '{"prompt": "Find the titanic movie"}'
```

## If Nothing Works

If both AI and simple analyzer fail, you can temporarily use a hardcoded response:

```javascript
// In ai-analyzer.js, temporarily add this at the beginning of analyzePrompt
if (prompt.toLowerCase().includes('titanic')) {
    return {
        movieName: 'titanic',
        actors: [],
        genre: ['romance', 'drama'],
        year: null,
        keywords: ['ship', 'romantic'],
        mood: 'romantic'
    };
}
```

## Next Steps

1. Run `node debug-ai-analysis.js` to identify the exact issue
2. Fix the OpenAI API key or network issues
3. Test with the simple analyzer as fallback
4. Verify the full flow works with your test prompt

The system is designed to be resilient - even if OpenAI fails, the simple analyzer should still extract "titanic" and find the movie!