const https = require('https');

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

// Run the test
testApi();