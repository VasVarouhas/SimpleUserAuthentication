const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Set up Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'static' directory
const staticPath = path.join(__dirname, 'static');
app.use(express.static(staticPath));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the user schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Define routes
app.post('/', async (req, res) => {
  const { username, password, action } = req.body;

  if (action === 'login') {
    try {
      const user = await User.findOne({ username, password });
      if (user) {
        res.redirect('/logged_in.html');
      } else {
        res.send('Invalid username or password');
      }
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  } else if (action === 'signup') {
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.send('Username already exists');
      } else {
        const newUser = new User({ username, password });
        await newUser.save();
        res.redirect('/logged_in.html');
      }
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400); // Invalid action
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
