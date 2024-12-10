import { MyTwitchDBEndpoint } from "./MyTwitchDBEndpoint.js";
import { SingleSocketServer } from "./SingleSocketServer.js";
import { TwitchIRCSocket } from "./TwitchIRCSocket.js";
import chalk from "chalk";

//================================//
export class MyTwitchChat extends TwitchIRCSocket {
    private ListeningSocketServers  : SingleSocketServer[] = [];

    //================================//
    constructor(_username: string, _channels: string[], _debug: boolean = false) {
        super(_username, _channels, _debug);

        this.getTwitchClient().on('message', (_channel: string, _tags: any, _message: string, _self: boolean) => {
            this.onReceivedTwitchMessage(_channel, _tags, _message, _self);
        });
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
        } catch (error: any) {
            console.error(chalk.red('Error sending message: ', error));
        }
    }

    //================================//
    protected onReceivedTwitchMessage(_channel: string, _tags: any, _message: string, _self: boolean): void {
        if (_self) return;

        this.ListeningSocketServers.forEach(server => {
            server.SendMessage('chat-message', { username: _tags.username, message: _message, channel: _channel });
        });

        switch (_message) {
            case '!ping':
                this.SendChatMessage(_channel, `Pong! {${_tags.username}}`);
                break;
            case '!hello':
                this.SendChatMessage(_channel, `Hello! {${_tags.username}}`);
                break;
            case '!register':
                MyTwitchDBEndpoint.RegisterUser(_tags.username, _tags['user-id'], 0).then((result) => {
                    if (result === 1) {
                        this.SendChatMessage(_channel, `Registered {${_tags.username}}`);
                    } else if (result === 0) {
                        this.SendChatMessage(_channel, `You are already registered {${_tags.username}}`);
                    } else if (result === -1) {
                        this.SendChatMessage(_channel, `Error registering {${_tags.username}}. We are sorry!`);
                    }
                });
                break;
            case '!click':
                MyTwitchDBEndpoint.AddClick(_tags['user-id'], 1).then((result) => {
                    if ( result === 0){
                        this.SendChatMessage(_channel, `You are not registered {${_tags.username}}! Use !register to register!`);
                    } else if (result === -1) {
                        this.SendChatMessage(_channel, `There was an error registering your click... {${_tags.username}}!`);
                    }
                });
                break;
            case '!unregister':
                MyTwitchDBEndpoint.UnregisterUser(_tags['user-id']).then((result) => {
                    if (result === 1) {
                        this.SendChatMessage(_channel, `Unregistered {${_tags.username}}`);
                    } else if (result === 0) {
                        this.SendChatMessage(_channel, `You are not registered {${_tags.username}}! Use !register to register!`);
                    } else if (result === -1) {
                        this.SendChatMessage(_channel, `Error unregistering {${_tags.username}}. We are sorry!`);
                    }
                });
                break;
        }
    }
}
