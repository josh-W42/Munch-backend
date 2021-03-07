// Imports
require('dotenv').config()
const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
require('./config/passport')(passport);

// App Set up
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // JSON parsing
app.use(cors()); // allow all CORS requests
app.use(passport.initialize());
app.use(express.static(path.resolve(__dirname, 'client', 'build')));

// API Routes
app.get('/api/', (req, res) => {
  res.json({ name: 'MERN Auth API', greeting: 'Welcome to the our API', author: 'YOU', message: "Smile, you are being watched by the Backend Engineering Team" });
});

app.use('/api/examples', routes.example);
app.use('/api/users', routes.user);

// Server
const server = app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

module.exports = server;
