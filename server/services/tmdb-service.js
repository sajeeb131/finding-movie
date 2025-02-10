const axios = require('axios');
const { TMDB_API_URL } = require('../utils/constants');
const { TMDB_API_KEY } = process.env;

// Function to search movies with given query parameters
const searchMovies = async (queryParams) => {
    console.log('The TMDB API KEY: ', TMDB_API_KEY);
    try {
        const response = await axios.get(`${TMDB_API_URL}/discover/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                ...queryParams
            }
        });

        return response.data.results || []; // Ensure an array is always returned
    } catch (error) {
        console.error('Error in searchMovies:', error);
        return []; // Return empty array on failure
    }
};

// Function to get actor or director ID from TMDb
const searchPerson = async (name) => {
    if (!name) return null; // Prevent errors if name is empty

    try {
        // Use encodeURIComponent for the search term to handle spaces and special characters
        name = encodeURIComponent(name); 
        
        const response = await axios.get(`${TMDB_API_URL}/search/person`, {
            params: {
                api_key: TMDB_API_KEY,
                query: name
            }
        });

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            console.log(`No results found for person: ${name}`);
            return null;
        }

        return response.data.results[0]; // Return the first result
    } catch (error) {
        console.error(`Error searching for person (${name}):`, error);
        return null;
    }
};

module.exports = { searchMovies, searchPerson };

