import { Socket } from '../../node_modules/socket.io/dist/index.js';
import { SingleSocketServer } from './SingleSocketServer.js';
import chalk from 'chalk';

//================================//
export class MyServer extends SingleSocketServer{

    SendMessage(_event: string, _data: any): void {
        let client = this.getSingleClient();
        if (client === null) {
            return;
        }

        client.emit(_event, _data);
    }

    //================================//
    constructor(_server: any, _origin: string) {
        super(_server, _origin);
    }

    //================================//
    protected onClientConnection(socket: Socket): void {
        super.onClientConnection(socket);
        
        console.log(chalk.yellow('Client connected:', socket.id));
    }
}