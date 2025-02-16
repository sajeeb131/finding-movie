const { searchMovies, searchPerson } = require('../services/tmdb-service');
const { extractKeywords } = require('../services/keyword-service');

const processPrompt = async (req, res) => {
  const prompt = req.body.prompt;
  console.log(prompt)
  if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
      // Step 1: Extract keywords from the prompt
      const keywords = await extractKeywords(prompt);

      const queries = {};
      // Step 2: Prioritize searching by movie name
      if (keywords.movieName) {
          queries.query = keywords.movieName;
      } else {
          // Step 3: Handle actor-based search (Convert Name → ID)
          if (keywords.actorNames && keywords.actorNames.length > 0) {
              const actor = await searchPerson(keywords.actorNames[0]);
              if (actor && actor.id) {
                  queries.with_cast = actor.id;
              }
          }

          // Step 4: Handle director-based search (Convert Name → ID)
          if (keywords.directorNames && keywords.directorNames.length > 0) {
              const director = await searchPerson(keywords.directorNames[0]);
              if (director && director.id) {
                  queries.with_crew = director.id;
              }
          }

          // Step 5: Add other filters if available
          if (keywords.releaseYear) queries.primary_release_year = keywords.releaseYear;
          if (keywords.genre) queries.with_genres = keywords.genre;
      }

      // Step 6: Fetch movies based on queries
      console.log('queries:', queries);
      const movies = await searchMovies(queries);
      res.status(200).json({ movies });

  } catch (error) {
      console.error("Error processing prompt:", error);
      res.status(500).json({
          message: "Failed to process prompt",
          error: error.message
      });
  }
};


module.exports = { processPrompt };





module.exports = {   processPrompt };


