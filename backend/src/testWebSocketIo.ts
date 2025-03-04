import express from "express";
import { createServer } from "http";
import { Server } from "socket.io"; // Socket.IO Server

const app = express();
const server = createServer(app);
const io = new Server(server, {
    path: "/socket.io/", // ✅ Ensure correct WebSocket path
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"], // ✅ Ensure WebSockets work
    allowEIO3: true // ✅ Support older Socket.io clients
});

// Handle WebSocket Connection
io.on("connection", (socket) => {
    console.log(`✅ Socket.IO Client Connected: ${socket.id}`);

    socket.on("message", (message) => {
        console.log("📩 Message received:", message);
        socket.send("Hello from Socket.IO server!");
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Client Disconnected: ${socket.id}`);
    });
});

app.get("/", (req, res) => {
    res.send("✅ Socket.IO Server is running!");
});

// Start the server (ONLY inside the VM)
const PORT = Number(process.env.PORT || 5000);
server.listen(PORT, "127.0.0.1", () => {
    console.log(`🚀 Socket.IO Server running at http://127.0.0.1:${PORT}`);
});
