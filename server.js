const express = require('express');
const connectDB = require('./config/db');
const app = express();
connectDB();//Connect Database

app.use(express.json({extended: false})); // Init Middleware
app.get("/", (req, res) => res.send("API Running"))

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sever started on port ${PORT}`));