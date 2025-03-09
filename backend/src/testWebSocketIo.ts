import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Adjust if needed
    }
});

// Simple API route
app.get('/api/test', (_req: Request, res: Response) => {
    res.json({ message: "Reverse proxy works with API!" });
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('message', (msg) => {
        console.log('Received message:', msg);
        socket.emit('message', `Server received: ${msg}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`Backend with WebSockets running on http://localhost:${PORT}`);
});
