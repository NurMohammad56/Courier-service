const express = require('express');
const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 5001;
const app = express();
const cors = require('cors');
const dbConnection = require('./db_config/dbConnection');

app.use(cors(origin = '*'));
app.use(express.json());

app.get("/", (req, res) => {
    return res.status(200).json({
        status : true,
        message : "Welcome to the server"
    });
});

app.listen(PORT, async() => {
    await dbConnection();
    console.log(`Server is running on port http://localhost:${PORT}`);
});




