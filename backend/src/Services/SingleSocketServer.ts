import { Server, Socket } from '../../node_modules/socket.io/dist/index.js';
import EventSystem from '../Middlewares/EventSystem.js';

//================================//
export abstract class SingleSocketServer {
    private m_io: Server;
    private m_singleClient: Socket | null = null;

    //================================//
    protected m_numberOfIncomingMessages: number = 0;
    protected m_numberOfOutgoingMessages: number = 0;
    protected m_totalIncomingSize: number = 0.0;
    protected m_totalOutgoingSize: number = 0.0;

    //================================//
    constructor(_server: any, _origin: string) {
        console.log("🚀 Initializing WebSocket Server...");
        this.m_io = new Server(_server,
            {
                cors: {
                    origin: _origin,
                    methods: ['GET', 'POST']
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
        EventSystem.Emit('new-client-connected', {});

        socket.on('disconnect', () => {
            this.m_singleClient = null;
        });
    }

    //================================//
    public getSingleClient(): Socket | null {
        return this.m_singleClient;
    }

    //================================//
    abstract SendMessage(_event: string, _data: any): void;

    //================================//
    public getUsageInformation(): string {
        const MBIncoming = (this.m_totalIncomingSize / 1024 / 1024).toFixed(3);
        const MBOutgoing = (this.m_totalOutgoingSize / 1024 / 1024).toFixed(3);
        return `Fom single socket server, Incoming messages: ${this.m_numberOfIncomingMessages}, Outgoing messages: ${this.m_numberOfOutgoingMessages}, Incoming size: ${MBIncoming} MB, Outgoing size: ${MBOutgoing} MB`;
    }

    //================================//
    public AmIConnected(): boolean {
        return this.m_singleClient !== null;
    }
}