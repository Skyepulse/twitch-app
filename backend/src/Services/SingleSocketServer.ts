import { Server, Socket } from '../../node_modules/socket.io/dist/index.js';

//================================//
export abstract class SingleSocketServer {
    private m_io: Server;
    private m_singleClient: Socket | null = null;

    //================================//
    constructor(_server: any, _origin: string) {
        this.m_io = new Server(_server);

        this.m_io.on('connection', (socket) => {
            this.onClientConnection(socket);
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
}