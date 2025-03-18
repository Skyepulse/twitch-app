import { Server, Socket } from '../../node_modules/socket.io/dist/index.js';
import EventSystem from '../Middlewares/EventSystem.js';
import { SocketServer } from './SocketServer.js';

//================================//
export abstract class SingleSocketServer extends SocketServer {
    private m_io: Server;
    private m_singleClient: Socket | null = null;

    //================================//
    constructor(_server: any, _origin: string) {
        super();

        console.log("🚀 Initializing WebSocket Server...");
        this.m_io = new Server(_server, {
            cors: {
                origin: _origin,
            }
        });

        this.m_io.on('connection', (socket) => {
            console.log(`✅ New WebSocket connection: ${socket.id}`);
            this.onClientConnection(socket);
        });

        _server.on('listening', () => {
            console.log("✅ WebSocket Server is now listening!");
        });
    }

    //================================//
    protected onClientConnection(socket: Socket): void {
        if (this.m_singleClient !== null) {
            console.log('A client is already connected. Disconnecting new client:', socket.id);
            socket.emit('error', { message: 'Only one client is allowed at a time.' });
            socket.disconnect();
            return;
        }

        this.m_singleClient = socket;
        this.m_singleClient.send('You are connected.');
        EventSystem.Emit('new-client-connected', {client_socket: socket});

        socket.on('disconnect', () => {
            this.m_singleClient = null;
        });
    }

    //================================//
    public getSingleClient(): Socket | null {
        return this.m_singleClient;
    }

    //================================//
    public AmIConnected(): boolean {
        return this.m_singleClient !== null;
    }
}