const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Add this for making HTTP requests
const cookieParser = require('cookie-parser'); // Add cookie parser

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware
app.use(express.static(__dirname));

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  const { user } = req.cookies;
  if (user) {
    next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    // User is not authenticated, redirect to login page
    res.redirect('/');
  }
};

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve gemini.html for the /gemini route (protected)
app.get('/sulaai', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'sulaai.html'));
});

// Login endpoint to set cookies
app.post('/login', (req, res) => {
  const { email, name } = req.body;
  
  // In a real application, you would validate the credentials here
  // For now, we'll assume the login is successful
  
  // Set user cookie with user details
  res.cookie('user', JSON.stringify({ email, name }), {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  });
  
  // Send success response
  res.json({ success: true });
});

// Logout endpoint to clear cookies
app.post('/logout', (req, res) => {
  res.clearCookie('user');
  res.json({ success: true });
});


// API endpoint for chat functionality
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    // Combine custom prompt and user message
    const promptText = `${message}`;
    
    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // API configuration
    const API_URL = `https://sula-ai.sulakshamadara0.workers.dev/prompt=${encodeURIComponent(message)}`;
    
    // Send request to the new API
    const response = await fetch(API_URL);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error.message);
    }
    
    const apiResponse = data.response.response;
    res.json({ response: apiResponse });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





