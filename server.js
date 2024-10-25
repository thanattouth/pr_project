const express = require('express');
const mysql = require('mysql2'); // Use mysql2 instead of mysql
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'nampun1', // Your MySQL username
    password: 'hamin1', // Your MySQL password
    database: 'test',
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
}).promise();

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database using mysql2');
});

// Multer setup for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Route to handle form submission
app.post('/register', upload.single('photo'), (req, res) => {
    const { username, email, password } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Insert user data into MySQL
    const sql = 'INSERT INTO users (username, email, password, photo_url) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, password, photoUrl], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
