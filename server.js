require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/heartconnect')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    gender: String
});

const User = mongoose.model('User', UserSchema);

// **Signup Route**
app.post('/signup', async (req, res) => {
    const { name, email, password, gender } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, gender });
        await newUser.save();
        res.json({ message: 'User Registered Successfully!' });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists!' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: 'User not found!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, gender: user.gender }, 'secretkey', { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, gender: user.gender });
});


// **Fix for "Cannot GET /" error**
app.get('/', (req, res) => {
    res.send('Welcome to HeartConnect API');
});

app.listen(5000, () => console.log('Server running on port 5000'));
