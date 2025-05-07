import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io'
import dbConnection from './config/dbConnection.js';
import globalErrorHandler from './src/middlewares/globalError.middlewares.js';
import notFound from './src/middlewares/notFound.middlewares.js';
import routes from './config/route.config.js';
const PORT = process.env.PORT || 5001;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

dotenv.config({ path: './.env' });

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    socket.on('joinProductRoom', (productId) => {
        socket.join(productId); 
        console.log(`Client joined room: ${productId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// root route
app.get("/", (req, res) => {
    return res.status(200).json({
        status: true,
        message: "Welcome to the server"
    });
});

// routes
app.use("/api/v1", routes);

// error handling middlewares
app.use(globalErrorHandler);
app.use(notFound);

app.listen(PORT, async () => {
    await dbConnection();
    console.log(`Server is running on port http://localhost:${PORT}`);
});


export { io }





