// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); 

const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');


// Import routes
const userRoutes = require('./routes/userRoutes'); 

const roleRoutes = require('./routes/roleRoutes'); 
const permissionRoutes = require('./routes/permissionRoutes');
const authRoutes = require('./routes/authRoutes'); 


// Initialize environment variables
dotenv.config();

// Create an Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Connect to the database
// Port setup
const PORT = process.env.PORT || 5000;
connectDB();    
// Define a simple route to verify the server is running
app.get('/', (req, res) => {
  res.send('RBAC Backend Server is Running');
});



app.post('/test', async (req, res) => {
    try {
    
    
      // Create a user with the admin role
      const user = await User.create({
        username: 'NewUser',
        email: 'newuser@example.com',
        password: 'password', // In production, hash the password!
        role: adminRole._id,
      });
  
      res.status(201).json(user);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Server error');
    }
  });



// Use routes
app.use('/users', userRoutes); // Handles requests to /users
app.use('/roles', roleRoutes); // Handles requests to /roles
app.use('/permissions', permissionRoutes); // Handles requests to /permissions
app.use('/auth', authRoutes); // Handles requests to /auth


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
