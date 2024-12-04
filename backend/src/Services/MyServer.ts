import { Socket } from 'socket.io';
import { SingleSocketServer } from './SingleSocketServer';
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