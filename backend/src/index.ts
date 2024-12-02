import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import tmi from 'tmi.js';

//------------Members-------------//
const m_app = express();
const m_server = http.createServer(m_app);
const m_io = new Server(m_server,{
    cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 5000;

let m_twitchClient: tmi.Client;

//----------Start Call-----------//
InitializeServer();

//================================//
function InitializeServer(): void {
    m_app.use(express.json());

    m_twitchClient = new tmi.Client({
        identity: {
          username: process.env.TWITCH_USERNAME!,
          password: process.env.TWITCH_OAUTH_TOKEN!,
        },
        channels: [process.env.TWITCH_CHANNEL!],
    });
    
    m_twitchClient  .connect()
                    .then(() => {
                        console.log('Connected to Twitch');
                    })
                    .catch((error) => {
                        console.error('Error connecting to Twitch: ', error);
                    });
    
    m_io.on('connection', (socket) => {
        onClientConnection(socket, m_twitchClient);
    });

    m_server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

//================================//
function onTwitchClient(channel:string, tags:any, message:string, self:boolean, socket:Socket): void {
    if (self) return;

    const chatMessage = { username: tags['display-name'] || 'Anonymous', message, channel };
    socket.emit('chat-message', chatMessage);
}

//================================//
function onClientConnection(socket:Socket, thirdPartyClient:tmi.Client): void {
    console.log('Client connected');

    thirdPartyClient.on('message', (channel, tags, message, self) => {
        onTwitchClient(channel, tags, message, self, socket);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
}