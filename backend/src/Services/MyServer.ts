import { Socket } from '../../node_modules/socket.io/dist/index.js';
import { MultipleSocketServer } from './MultipleSocketServer.js';
import chalk from 'chalk';

//================================//
export class MyServer extends MultipleSocketServer {

    //================================//
    SendMessage(_id: string, _event: string, _data: any): void {
        let client = this.m_Clients?.find((client) => client.id === _id);
        if (client === null) {
            return;
        }

        if ( client !== undefined ) {
            client.emit(_event, _data);

            this.m_numberOfOutgoingMessages++;
            this.m_totalOutgoingSize += Buffer.byteLength(JSON.stringify(_data));
        }
    }

    //================================//
    BroadcastMessage(_event: string, _data: any): void {
        if (this.m_Clients === null) {
            return;
        }

        this.m_Clients.forEach((client) => {
            client.emit(_event, _data);

            this.m_numberOfOutgoingMessages++;
            this.m_totalOutgoingSize += Buffer.byteLength(JSON.stringify(_data));
        });
    }

    //================================//
    constructor(_server: any, _origin: string, _maxClients: number) {
        super(_server, _origin, _maxClients);
    }

    //================================//
    protected onClientConnection(socket: Socket): void {
        super.onClientConnection(socket);
        
        console.log(chalk.yellow('Client connected:', socket.id));
    }
}