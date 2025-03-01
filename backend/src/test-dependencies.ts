console.log("🔍 Testing dependencies...\n");

async function testDependencies() {
    try {
        // PostgreSQL (pg)
        const pkg = await import("pg");
        console.log("✅ pg imported successfully");

        const { Pool } = await import("pg");
        console.log("✅ Pool imported successfully");

        // Chalk (Terminal coloring)
        const chalk = await import("chalk");
        console.log("✅ chalk imported successfully");

        // Socket.io
        const { Socket } = await import("socket.io");
        console.log("✅ Socket imported successfully");

        // Twitch Messaging Interface (TMI)
        const tmi = await import("tmi.js");
        console.log("✅ tmi imported successfully");

        // Dotenv (Environment Variables)
        await import("dotenv/config");
        console.log("✅ dotenv imported successfully");

        // WebSocket
        const WebSocket = await import("ws");
        console.log("✅ ws imported successfully");

        // Open (Open URLs)
        const open = await import("open");
        console.log("✅ open imported successfully");

        // Express (Backend Framework)
        const express = await import("express");
        console.log("✅ express imported successfully");

        // HTTP Module
        const { createServer } = await import("http");
        console.log("✅ http imported successfully");

        console.log("\n🎉 All dependencies were successfully imported!\n");

    } catch (error) {
        console.error("❌ Error importing dependencies:", error);
        process.exit(1);
    }
}

// Run the function
testDependencies();
//================================//