const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const analysisRoutes = require('./routes/analysisRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Plan Analyzer Backend is running' });
});

// Routes
app.use('/api', analysisRoutes);

// MongoDB is optional for local demos. Analysis still works without history.
if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => console.error('MongoDB Connection Error:', err));
} else {
    console.warn('MongoDB URI not configured. Analysis history will not be saved.');
}

app.listen(PORT, () => {
    console.log(`Backend Server listening on port ${PORT}`);
});
