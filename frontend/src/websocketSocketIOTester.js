const https = require('https');
const { io } = require('socket.io-client');

async function testApi() {
    const options = {
        hostname: 'www.008032025.xyz',
        path: '/api/test',
        method: 'GET',
        port: 443, // HTTPS default port
        headers: {
            'User-Agent': 'Node.js Client'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log("Response from API:", data);
        });
    });

    req.on('error', (error) => {
        console.error("Error fetching API:", error.message);
    });

    req.end();
}

// Test WebSocket connection
function testSocket() {
    const socket = io('https://www.008032025.xyz', {
        path: '/socket.io/', // Important for reverse proxy
        secure: true,
        reconnection: true,
        rejectUnauthorized: false // Allow self-signed certs if necessary
    });

    socket.on('connect', () => {
        console.log("Connected to WebSocket:", socket.id);
        socket.emit('message', "Hello Server!");
    });

    socket.on('message', (data) => {
        console.log("Received from server:", data);
    });

    socket.on('disconnect', () => {
        console.log("Disconnected from WebSocket");
    });
}

// Run tests
testApi();
testSocket();
