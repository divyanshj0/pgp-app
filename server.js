const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is not defined in the .env file!');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  mobileNumber: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  familyMembers: [{
    firstName: String,
    lastName: String,
    gender: String,
    age: Number,
  }],
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please log in.' });
    }

    const newUser = new User({ firstName, lastName, mobileNumber, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error); // Log the detailed error to the console
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Username or  password.' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    res.status(200).json({ message: 'Logged in successfully!' ,token});
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});
app.use((req, res, next) => {
  req.userId = 'your_hardcoded_user_id'; // Replace with a valid ObjectId from your database
  next();
});
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Route to fetch all appointments for a user
app.get('/api/appointments',verifyToken, async (req, res) => {
  try {
    // In a real app, you'd get the user ID from the authenticated request
    const userId = req.userId;
    
    // Find all appointments associated with the user and populate the user details
    const appointments = await Appointment.find({ user: userId });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching appointments.' });
  }
});

// Route to book a new appointment
app.post('/api/appointments',verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Get user ID from the (simulated) authenticated request
    const { name, gender, age, mobileNumber, reason, date, timeSlot } = req.body;
    
    const newAppointment = new Appointment({
      patientName: name,
      gender,
      age,
      mobileNumber,
      reason,
      date,
      timeSlot,
      user: userId,
    });
    
    await newAppointment.save();
    // Add the new appointment's ID to the user's appointments array
    const user = await User.findById(userId);
    if (user) {
      user.appointments.push(newAppointment._id);
      await user.save();
    }

    res.status(201).json({ message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during appointment booking.' });
  }
});

// Route to fetch a user's profile information
app.get('/api/profile',verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    // Find the user by their ID and select all fields except the password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
});

// Route to add a new family member to the user's profile
app.post('/api/profile/family-members',verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName,lastName, age, gender } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    const newFamilyMember = {
      firstName:firstName,
      lastName:lastName,
      age,
      gender,
    };
    
    user.familyMembers.push(newFamilyMember);
    await user.save();
    
    res.status(201).json({ message: 'Family member added successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while adding family member.' });
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));