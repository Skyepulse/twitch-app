const { io } = require("socket.io-client");
const dotenv = require("dotenv");

dotenv.config({ path: process.env.ENV_PATH || ".env" });

// Determine WebSocket URL
const SOCKET_URL =
  process.env.REACT_APP_BACKEND_LB === "localhost"
    ? `ws://${process.env.REACT_APP_BACKEND_LB}:${process.env.REACT_APP_BACKEND_PORT}`
    : `${process.env.REACT_APP_BACKEND_PROTOCOL || "wss"}://${process.env.REACT_APP_BACKEND_HOST || "localhost"}:${process.env.REACT_APP_BACKEND_PORT || 8080}/socket.io/`;

console.log("🚀 Connecting to WebSocket:", SOCKET_URL);

// Initialize Socket.IO client
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  timeout: 5000,
  secure: SOCKET_URL.startsWith("wss"),
});

// Handle successful connection
socket.on("connect", () => {
  console.log("✅ Socket.IO connected!");
  socket.send("Hello Server!");
});

// Handle incoming messages
socket.on("message", (data) => {
  console.log("📩 Message from server:", data);
});

// Handle connection errors
socket.on("connect_error", (err) => {
  console.error("❌ Socket.IO Error:", err.message);
});

// Handle disconnection
socket.on("disconnect", (reason) => {
  console.warn(`⚠️ Socket.IO disconnected. Reason: ${reason}`);
});

// Attempt reconnection when disconnected
socket.on("reconnect_attempt", (attemptNumber) => {
  console.log(`🔄 Reconnect attempt #${attemptNumber}`);
});

socket.on("reconnect_failed", () => {
  console.error("🚫 Reconnection failed after multiple attempts.");
});

socket.on("reconnect", (attemptNumber) => {
  console.log(`✅ Reconnected successfully on attempt #${attemptNumber}`);
});
