import { MyTwitchDBEndpoint } from "./MyTwitchDBEndpoint.js";
import { SingleSocketServer } from "./SingleSocketServer.js";
import { TwitchIRCSocket } from "./TwitchIRCSocket.js";
import chalk from "chalk";

//================================//
export class MyTwitchChat extends TwitchIRCSocket {
    private ListeningSocketServers  : SingleSocketServer[] = [];

    private lastTopN: number = 0;
    private n_low: number = 0;
    private n_high: number = 3;
    private topN: number = 3;

    //================================//
    constructor(_username: string, _channels: string[], _debug: boolean = false) {
        super(_username, _channels, _debug);
    }

    //================================//
    public override initializeConnection(): void {
        super.initializeConnection();

        this.getTwitchClient().on('message', (_channel: string, _tags: any, _message: string, _self: boolean) => {
            this.onReceivedTwitchMessage(_channel, _tags, _message, _self);
        });

        setInterval(() => {
            this.SendTotalClicks();
        }, 2000);

        setInterval(() => {
            this.sendTopNClickers(this.n_low, this.n_high);
        }, 2000);

        setInterval(() => {
            if (this.n_high < this.lastTopN) {
                this.n_low += this.topN;
                this.n_high += this.topN;
            } else {
                this.n_low = 0;
                this.n_high = this.topN;
            }
        }, 10000);
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
    private SendTotalClicks(){
        MyTwitchDBEndpoint.GetTotalClicks().then((result) => {
            if (result === -1) {
                console.error(chalk.red('Error getting total clicks!'));
            } else {
                this.ListeningSocketServers.forEach(server => {
                    server.SendMessage('total-clicks', { totalClicks: result });
                });
            }
        });
    }   

    //================================//
    private sendTopNClickers(n_low: number, n_high: number): void {
        MyTwitchDBEndpoint.GetTopNClickers().then((result) => {
            if (result === null) {
                console.error(chalk.red('Error getting top clickers!'));
            } else {
                if (result.length !== 0) {
                    // slice between n_low and n_high and add a position to each element starting from n_low + 1 to n_high + 1
                    let topClickers: { position: number, user_id: number, username: string, click_count: number }[] = [];
                    for (let i = n_low; i < n_high; i++) {
                        if (i < result.length) {
                            topClickers.push({ position: i + 1, user_id: result[i].user_id, username: result[i].username, click_count: result[i].click_count });
                        }
                    }

                    this.lastTopN = result.length;
                    this.ListeningSocketServers.forEach(server => {
                        server.SendMessage('top-clickers', { topClickers: topClickers });
                    });
                }
            }
        });
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

        if (_message.startsWith('!')) {
            this.onReceivedCommand(_channel, _tags, _message);
        }
    }

    //================================//
    protected onReceivedCommand(_channel: string, _tags: any, _message: string): void {
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
                    } else {
                        this.SendTotalClicks();
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
            default:
                this.SendChatMessage(_channel, `The command ${_message} does not exist. Use !help to see the available commands.`);
                break;
        }
    }
}