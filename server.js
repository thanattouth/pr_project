const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();

// Constants for security
const SALT_ROUNDS = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route to serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer setup with security checks
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const sanitizedFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9]/g, '');
        cb(null, `${Date.now()}-${sanitizedFilename}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => cb(null, ALLOWED_FILE_TYPES.includes(file.mimetype)),
    limits: { fileSize: MAX_FILE_SIZE }
});

// MySQL connection pool
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

// Check database connection
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

// Registration route
app.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const sql = 'INSERT INTO users (username, email, password, photo_path) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(sql, [username, email, hashedPassword, photoUrl]);

        res.status(201).json({ success: true, message: 'User registered successfully', userId: result.insertId });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
    }
});

// Serve uploaded photos securely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3000, () => console.log('Server is running on port 3000'));