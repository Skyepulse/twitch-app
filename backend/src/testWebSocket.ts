import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws"; // WebSocket Server

//Import process.env
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true }); // Ensure WebSockets are handled separately

// WebSocket Upgrade Handling
server.on("upgrade", (request, socket, head) => {
    if (request.url === "/") {  // ✅ Ensure only WebSocket requests are handled
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
        });
    } else {
        socket.destroy();  // ❌ Reject invalid WebSocket requests
    }
});

// WebSocket Connection Handling
wss.on("connection", (ws) => {
    console.log("✅ WebSocket Client Connected");

    ws.on("message", (message) => {
        console.log("📩 Message received:", message.toString());
        ws.send("Hello from WebSocket server!");
    });

    ws.on("close", () => {
        console.log("🔴 WebSocket Connection Closed");
    });
});

app.get("/", (req, res) => {
    res.send("✅ WebSocket Server is running!");
});

console.log('environment: \n'  + process.env);
// Ensure WebSocket server listens on 5000
server.listen(Number(process.env.PORT || 5001), '0.0.0.0', () => {
    console.log("🚀 Server running on port " + (process.env.PORT || '5001'));
});
