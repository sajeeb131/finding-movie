const mongoose =  require('mongoose')

const castSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tmdbId:{
        type: Number,
        required: false
    },
    rating:{
        type: Number,
        required: false
    },
    image_path: {
        type: String,
        required: false
    },
    objectID:{
        type: String,
        required: false
    },
    alternative_name: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Cast', castSchema)