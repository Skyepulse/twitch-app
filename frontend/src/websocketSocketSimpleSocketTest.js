import WebSocket from "ws";

const ws = new WebSocket("wss://008032025.xyz:5000");

ws.on("open", () => {
  console.log("✅ Connected to WebSocket server");
  ws.send("Hello from client!");
});

ws.on("message", (message) => {
  console.log("📩 Received:", message.toString());
});

ws.on("close", () => console.log("🔴 WebSocket Closed"));
ws.on("error", (err) => console.error("⚠️ WebSocket Error:", err));