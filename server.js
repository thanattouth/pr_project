const express = require('express');
const mysql = require('mysql2/promise'); // Note the /promise import
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MySQL connection pool instead of single connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'nampun1',
    password: 'hamin1',
    database: 'test',
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database using mysql2');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}
testConnection();

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Multer setup for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Add file type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'), null);
        }
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route to handle form submission
app.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

        // Insert user data into MySQL using prepared statement
        const sql = 'INSERT INTO users (username, email, password, photo_path) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(sql, [username, email, password, photoUrl]);

        console.log('Registration successful:', result);
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (err) {
        console.error('Registration error:', err);
        
        // Handle duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false,
                error: 'Username or email already exists' 
            });
        }

        res.status(500).json({ 
            success: false,
            error: 'Registration failed. Please try again.' 
        });
    }
});

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false,
        error: 'Something went wrong!' 
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});