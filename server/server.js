const express = require('express');
const connectDB = require('./config/db');
const movieRoutes = require('./routes/movie-route');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Basic route for testing
app.get('/', (req, res) => {
  console.log('Hello World');
  res.status(200).json({ message: 'Found it!' });
});

// Movie routes
app.use('/api', movieRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));