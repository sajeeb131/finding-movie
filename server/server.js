require('dotenv').config()

const express = require('express');
const connectDB = require('./config/db');
const movieRoutes = require('./routes/movie-route');
const aiMovieRoutes = require('./routes/ai-movie-route');
const cors = require('cors');
const dotenv = require('dotenv');

connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Original movie routes (keep for backward compatibility)
app.use('/api', movieRoutes);

// New AI-powered movie routes
app.use('/api/ai', aiMovieRoutes);

// Start the server
const PORT =  process.env.PORT;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

//deployment comment ..