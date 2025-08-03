// chef-booking-backend.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://saptarshi5:saptarshi5@cluster0.s4xqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'chef'], default: 'user' },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const chefSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  speciality: [String],
  experience: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  bio: { type: String },
  rating: { type: Number, default: 0 },
  availableDates: [Date],
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
});

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }, // in hours
  location: { type: String, required: true },
  menu: { type: String },
  specialInstructions: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'canceled'], default: 'pending' },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

// Create models
const User = mongoose.model('User', userSchema);
const Chef = mongoose.model('Chef', chefSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Message = mongoose.model('Message', messageSchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed: ' + error.message });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

// ROUTES

// Auth Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// User Routes
app.get('/api/users/me', authenticate, (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ id: _id, name, email, role });
});

app.put('/api/users/me', authenticate, async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Chef Routes
app.post('/api/chefs/profile', authenticate, authorize(['chef']), async (req, res) => {
  try {
    const { speciality, experience, hourlyRate, bio, availableDates } = req.body;
    
    // Check if profile already exists
    let chefProfile = await Chef.findOne({ userId: req.userId });
    
    if (chefProfile) {
      // Update existing profile
      chefProfile = await Chef.findOneAndUpdate(
        { userId: req.userId },
        { speciality, experience, hourlyRate, bio, availableDates },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      chefProfile = new Chef({
        userId: req.userId,
        speciality,
        experience,
        hourlyRate,
        bio,
        availableDates
      });
      
      await chefProfile.save();
    }
    
    res.status(201).json({ message: 'Chef profile created/updated successfully', chefProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/chefs', async (req, res) => {
  try {
    const { speciality, minRate, maxRate, date } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (speciality) {
      filter.speciality = { $in: Array.isArray(speciality) ? speciality : [speciality] };
    }
    
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = minRate;
      if (maxRate) filter.hourlyRate.$lte = maxRate;
    }
    
    if (date) {
      // Find chefs available on this date
      filter.availableDates = { $elemMatch: { $gte: new Date(date) } };
    }
    
    const chefs = await Chef.find(filter).populate('userId', 'name profilePicture');
    
    res.json(chefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/chefs/:id', async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id).populate('userId', 'name profilePicture');
    
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }
    
    res.json(chef);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Booking Routes
app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const { chefId, date, duration, location, menu, specialInstructions } = req.body;
    
    // Find chef to calculate price
    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }
    
    // Calculate total price
    const totalPrice = chef.hourlyRate * duration;
    
    // Create booking
    const newBooking = new Booking({
      userId: req.userId,
      chefId,
      date,
      duration,
      location,
      menu,
      specialInstructions,
      totalPrice
    });
    
    await newBooking.save();
    
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    
    // If user is chef, show bookings for them
    if (req.user.role === 'chef') {
      const chefProfile = await Chef.findOne({ userId: req.userId });
      if (chefProfile) {
        filter.chefId = chefProfile._id;
      } else {
        return res.status(404).json({ message: 'Chef profile not found' });
      }
    } else {
      // If regular user, show their bookings
      filter.userId = req.userId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate({
        path: 'chefId',
        populate: {
          path: 'userId',
          select: 'name profilePicture'
        }
      });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/bookings/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate({
        path: 'chefId',
        populate: {
          path: 'userId',
          select: 'name profilePicture'
        }
      });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify user has access to this booking
    if (req.user.role === 'chef') {
      const chefProfile = await Chef.findOne({ userId: req.userId });
      if (!chefProfile || !booking.chefId.equals(chefProfile._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (!booking.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.put('/api/bookings/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has permission to update status
    if (req.user.role === 'chef') {
      const chefProfile = await Chef.findOne({ userId: req.userId });
      if (!chefProfile || !booking.chefId.equals(chefProfile._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Chef can only confirm or cancel
      if (!['confirmed', 'canceled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status change' });
      }
    } else if (!booking.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    booking.status = status;
    await booking.save();
    
    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Review Routes
app.post('/api/chefs/:id/reviews', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const chef = await Chef.findById(req.params.id);
    
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }
    
    // Check if user has booked this chef and booking is completed
    const hasCompletedBooking = await Booking.findOne({
      userId: req.userId,
      chefId: chef._id,
      status: 'completed'
    });
    
    if (!hasCompletedBooking) {
      return res.status(403).json({ message: 'You can only review chefs after a completed booking' });
    }
    
    // Add review
    chef.reviews.push({
      userId: req.userId,
      rating,
      comment
    });
    
    // Recalculate average rating
    const totalRating = chef.reviews.reduce((sum, review) => sum + review.rating, 0);
    chef.rating = totalRating / chef.reviews.length;
    
    await chef.save();
    
    res.status(201).json({ message: 'Review added successfully', chef });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Message Routes
app.post('/api/messages', authenticate, async (req, res) => {
  try {
    const { receiverId, content, bookingId } = req.body;
    
    // If bookingId is provided, verify user has access to this booking
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Verify user is part of this booking
      const chefProfile = await Chef.findById(booking.chefId);
      if (!booking.userId.equals(req.userId) && !chefProfile.userId.equals(req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const newMessage = new Message({
      bookingId,
      senderId: req.userId,
      receiverId,
      content
    });
    
    await newMessage.save();
    
    // Emit real-time message via Socket.io
    io.to(receiverId.toString()).emit('new_message', {
      messageId: newMessage._id,
      senderId: req.userId,
      content,
      timestamp: newMessage.timestamp,
      bookingId
    });
    
    res.status(201).json({ message: 'Message sent successfully', messageData: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/messages', authenticate, async (req, res) => {
  try {
    const { withUser, bookingId } = req.query;
    let filter = {};
    
    if (bookingId) {
      filter.bookingId = bookingId;
    }
    
    if (withUser) {
      filter.$or = [
        { senderId: req.userId, receiverId: withUser },
        { senderId: withUser, receiverId: req.userId }
      ];
    } else {
      filter.$or = [
        { senderId: req.userId },
        { receiverId: req.userId }
      ];
    }
    
    const messages = await Message.find(filter)
      .sort({ timestamp: 1 })
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.put('/api/messages/markRead', authenticate, async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        receiverId: req.userId // Make sure user can only mark their own messages as read
      },
      { read: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Set up Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join user's room (using their userId)
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.join(decoded.userId);
      console.log(`User ${decoded.userId} authenticated on socket ${socket.id}`);
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
    }
  });
  
  // Handle private messaging
  socket.on('send_message', async (data) => {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }
      
      const { receiverId, content, bookingId } = data;
      
      // Save message to database
      const newMessage = new Message({
        bookingId,
        senderId: socket.userId,
        receiverId,
        content
      });
      
      await newMessage.save();
      
      // Send to receiver
      io.to(receiverId).emit('new_message', {
        messageId: newMessage._id,
        senderId: socket.userId,
        content,
        timestamp: newMessage.timestamp,
        bookingId
      });
      
      // Confirm delivery to sender
      socket.emit('message_sent', { messageId: newMessage._id });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit('user_typing', { userId: socket.userId });
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(8000, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };