const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Models
const User = mongoose.model('User', {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const FinancialRecord = mongoose.model('FinancialRecord', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    monthlyIncome: { type: Number, required: true },
    rent: { type: Number, required: true },
    otherExpenses: { type: Number, required: true },
    roomExpenses: { type: Number, required: true },
    sipAmount: { type: Number, required: true }
});

const Expense = mongoose.model('Expense', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['delayed', 'room'] }
});

const Transaction = mongoose.model('Transaction', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['given', 'taken'] },
    personName: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    recoveryDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['pending', 'completed'] }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// API Routes
app.use('/api/auth', require('./routes/auth'));

// Protected Routes
app.get('/api/records', authenticateToken, async (req, res) => {
    try {
        const records = await FinancialRecord.find({ userId: req.user.id });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/records', authenticateToken, async (req, res) => {
    try {
        const record = new FinancialRecord({
            userId: req.user.id,
            ...req.body
        });
        await record.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const expense = new Expense({
            userId: req.user.id,
            ...req.body
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const transaction = new Transaction({
            userId: req.user.id,
            ...req.body
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve static files
app.use(express.static(__dirname));

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404 errors
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: 'API route not found'
        });
    } else {
        res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 