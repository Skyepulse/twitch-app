import WebSocket from "ws";

const ws = new WebSocket("ws://137.194.13.189:8080");

ws.on("open", () => {
  console.log("✅ Connected to WebSocket server");
  ws.send("Hello from client!");
});

ws.on("message", (message) => {
  console.log("📩 Received:", message.toString());
});

ws.on("close", () => console.log("🔴 WebSocket Closed"));
ws.on("error", (err) => console.error("⚠️ WebSocket Error:", err));