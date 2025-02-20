import { io } from "socket.io-client";
import dotenv from 'dotenv';
dotenv.config({ path: process.env.ENV_PATH || '.env' });

const SOCKET_URL = "ws://" + process.env.REACT_APP_BACKEND_LB + ":" + process.env.REACT_APP_BACKEND_PORT;
console.log("🚀 ~ file: websocketTester.js ~ line 4 ~ SOCKET_URL", SOCKET_URL);
const socket = io(SOCKET_URL);

socket.on("connect", () => {
    console.log("✅ Socket.IO connected!");
    socket.send("Hello Server!");
});

socket.on("message", (data) => {
    console.log("📩 Message from server:", data);
});

socket.on("connect_error", (err) => {
    console.error("❌ Socket.IO Error:", err.message);
});

socket.on("disconnect", (reason) => {
    console.warn(`⚠️ Socket.IO disconnected. Reason: ${reason}`);
});
