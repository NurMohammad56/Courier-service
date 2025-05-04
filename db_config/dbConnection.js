const mopngoose = require('mongoose');
const dotenv = require('dotenv').config();
const dbConnection = async () => {
    try {
        await mopngoose.connect(process.env.MongoDB_URI)
        console.log("db connection successful");
    } catch (error) {
        console.error("db connection failed", error);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = dbConnection;