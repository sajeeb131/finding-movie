import { useState } from 'react';
import axios from 'axios';

const FirstGrid = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Make the request to your backend API to get movie recommendations
      const res = await axios.post('http://localhost:5000/api/search', {
        prompt,
      });
      
      // Assuming the response contains an array of movies
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error('Error fetching movie recommendations:', err);
      setError('Failed to fetch movie recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-grid-container">
      <h1>Movie Finder</h1>

      {/* Prompt input and submit button */}
      <form onSubmit={handleSubmit} className="movie-search-form">
        <input
          type="text"
          value={prompt}
          onChange={handleChange}
          placeholder="Enter a movie prompt..."
          className="movie-input"
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Searching...' : 'Find Movies'}
        </button>
      </form>

      {/* Display error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Display movie recommendations */}
      {movies.length > 0 && (
        <div className="movie-list">
          <h2>Recommended Movies</h2>
          <ul>
            {movies.map((movie, index) => (
              <li key={index} className="movie-item">
                <h3>{movie.title}</h3>
                <p>{movie.overview}</p>
                {movie.posterPath && <img src={movie.posterPath} alt={movie.title} width="100" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FirstGrid;
