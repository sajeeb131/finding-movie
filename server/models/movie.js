const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    title: String,
    cast: [String],
    description: String,
    direction: String,
    genre: [String],
    year: Number,
    trailer: String,
    coverPhoto: String,
    imdbRating: Number,
    rotterTomatoesRating: Number,
    studio: String
})

module.exports = mongoose.model('Movie', movieSchema)