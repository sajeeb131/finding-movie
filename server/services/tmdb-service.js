const axios = require('axios');
const {TMDB_API_URL} = require('../utils/constants');
const {TMDB_API_KEY} = process.env;

const searchMovies = async(queryParams) => {
    console.log('The TMDB API KEY: ', TMDB_API_KEY);
    try{
        const response = await axios.get(TMDB_API_URL, {
            params: {
                api_key: TMDB_API_KEY,
                ...queryParams
            }
        })
        return response.data.results
    }
    catch(error){
        console.error('Error in tmdbService.js: ', error);
        throw error;
    }
}

module.exports = {searchMovies};