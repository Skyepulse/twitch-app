import { SingleSocketServer } from "./SingleSocketServer";
import { TwitchIRCSocket } from "./TwitchIRCSocket";
import { Socket } from 'socket.io';

//================================//
export class MyTwitchChat extends TwitchIRCSocket {
    private ListeningSocketServers  : SingleSocketServer[] = [];

    //================================//
    constructor(_username: string, _password: string, _channels: string[], _debug: boolean = false) {
        super(_username, _password, _channels, _debug);

        this.getTwitchClient().on('message', (channel, tags, message, self) => {
            this.onReceivedTwitchMessage(channel, tags, message, self);
        });
    }

    //================================//
    protected onReceivedTwitchMessage(_channel: string, _tags: any, _message: string, _self: boolean): void {
        if (_self) return;

        this.ListeningSocketServers.forEach(server => {
            server.SendMessage('chat-message', { username: _tags.username, message: _message, channel: _channel });
        });

        this.SendChatMessage(_channel, `Hello ! ${_tags.username}!`);
    }

    //================================//
    public addListenerServer(_server: SingleSocketServer): void {
        if (_server === null) return;

        this.ListeningSocketServers.push(_server);
    }

    //================================//
    public removeListenerSocket(_server: SingleSocketServer): void {
        const index = this.ListeningSocketServers.indexOf(_server);
        if (index !== -1) {
            this.ListeningSocketServers.splice(index, 1);
        }
    }

    //================================//
    public SendChatMessage(_channel: string, _message: string): void {
        try {
            this.getTwitchClient().say(_channel, _message);
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    }
}
