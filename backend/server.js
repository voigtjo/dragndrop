// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const formRoutes = require('./routes/formRoutes');
const formDataRoutes = require('./routes/formDataRoutes'); // Import form data routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing form data

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api/forms', formRoutes);
// Register routes
app.use('/api/formdata', formDataRoutes); // Register form data routes

// Server Status Route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Listening to the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
