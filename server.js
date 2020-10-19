const express = require('express');
const path = require('path')
const connectDB = require('./config/db');


const app = express();

// connect Database
connectDB();

// Init BodyParser
app.use(express.json({ extend: false}));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/v1/users', require('./routes/api/users'));
app.use('/api/v1/auth', require('./routes/api/auth'));
app.use('/api/v1/profile', require('./routes/api/profile'))
app.use('/api/v1/posts', require('./routes/api/posts'));

// serve static asset in production
if (process.env.NODE_ENV === 'production') {
    // set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log('Server running on PORT', PORT ));
