import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbConnection from './config/dbConnection.js';
import globalErrorHandler from './src/middlewares/globalError.middlewares.js';
import notFound from './src/middlewares/notFound.middlewares.js';
import routes from './config/route.config.js';
const PORT = process.env.PORT || 5001;

const app = express();

dotenv.config({ path: './.env' });

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(globalErrorHandler);
app.use(notFound);

app.get("/", (req, res) => {
    return res.status(200).json({
        status : true,
        message : "Welcome to the server"
    });
});

app.use("/api/v1", routes);

app.listen(PORT, async() => {
    await dbConnection();
    console.log(`Server is running on port http://localhost:${PORT}`);
});






