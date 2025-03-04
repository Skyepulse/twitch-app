import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws"; // WebSocket Server

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true }); // Ensure WebSockets are handled separately

// WebSocket Upgrade Handling
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
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

// Ensure WebSocket server listens on 5000
server.listen(Number(process.env.PORT || 5000), '127.0.0.1', () => {
    console.log("🚀 Server running on port " + (process.env.PORT || '5000'));
});
