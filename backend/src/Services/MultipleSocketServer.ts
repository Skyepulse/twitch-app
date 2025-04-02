import { Server, Socket } from '../../node_modules/socket.io/dist/index.js';
import EventSystem from '../Middlewares/EventSystem.js';
import { SocketServer } from './SocketServer.js';

//================================//
export abstract class MultipleSocketServer extends SocketServer {
    private m_io: Server;
    protected m_Clients: Socket[] | null = null;

    //================================//
    protected m_numberOfIncomingMessages: number = 0;
    protected m_numberOfOutgoingMessages: number = 0;
    protected m_totalIncomingSize: number = 0.0;
    protected m_totalOutgoingSize: number = 0.0;

    protected m_maxClients: number = 0;

    //================================//
    constructor(_server: any, _origin: string, _maxClients: number) {
        super();

        console.log("🚀 Initializing WebSocket Server...");
        this.m_io = new Server(_server, {
            cors: {
                origin: _origin,
            }
        });

        this.m_io.on('connection', (socket) => {
            //console.log(`✅ New WebSocket connection: ${socket.id}`);
            this.onClientConnection(socket);
        });

        _server.on('listening', () => {
            console.log("✅ WebSocket Server is now listening!");
        });

        this.m_maxClients = _maxClients > 1 ? _maxClients : 1;
        this.m_Clients = [];
    }

    //================================//
    protected onClientConnection(socket: Socket): void {
        if (this.m_Clients === null) {
            console.log('Clients array is not initialized.');
            return;
        }

        if (this.m_Clients?.find((client) => client.id === socket.id)) {
            console.log('Client zith same ID already connected. Disconnecting new client:', socket.id);
            socket.emit('error', { message: 'You are already connected with this ID.' });
            socket.disconnect();
            return;
        }

        if (this.m_Clients.length >= this.m_maxClients) {
            console.log('Maximum number of clients reached. Disconnecting new client:', socket.id);
            socket.emit('error', { message: 'Maximum number of clients reached. Please try later.' });
            socket.disconnect();
            return;
        }

        this.m_Clients.push(socket);
        //console.log('Total clients:', this.m_Clients.length);

        socket.send('You are connected.');
        EventSystem.Emit('new-client-connected', {client_socket: socket});

        socket.on('disconnect', () => {
            if (this.m_Clients === null) {
                console.log('Clients array is not initialized.');
                return;
            }

            this.m_Clients = this.m_Clients.filter((client) => client.id !== socket.id);
            //console.log('Total clients:', this.m_Clients.length);
        });
    }

    //================================//
    private getClientById(id: string): Socket | null {
        return this.m_Clients?.find((client) => client.id === id) || null;
    }

    //================================//
    public AmIConnected(): boolean {
        return this.m_Clients !== null && this.m_Clients.length > 0;
    }
}