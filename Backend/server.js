const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const { auth } = require('./middleware/auth');
const routes = require('./routes');
const Driver = require('./models/Driver');
const Offense = require('./models/Offense');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Protected test route
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'You have access to protected route', user: req.user });
});

// Routes
app.use('/api', routes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drivers', auth, require('./routes/drivers'));
app.use('/api/offenses', auth, require('./routes/offenses'));
app.use('/api/dashboard', auth, require('./routes/dashboard'));

app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find({});
    console.log('Fetched drivers:', drivers);
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Error fetching drivers' });
  }
});

app.get('/api/offenses', async (req, res) => {
  try {
    const offenses = await Offense.find({});
    console.log('Fetched offenses:', offenses);
    res.json(offenses);
  } catch (error) {
    console.error('Error fetching offenses:', error);
    res.status(500).json({ message: 'Error fetching offenses' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Enable mongoose debugging
mongoose.set('debug', true);
