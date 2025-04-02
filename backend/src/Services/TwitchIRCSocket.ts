import tmi from 'tmi.js';
import chalk from 'chalk';
import { MyTokenManager } from './MyTokenManager.js';

//================================//
export class TwitchIRCSocket {

    //================================//
    private reconnectInterval: number = 20 * 1000;
    private isReconnecting: boolean = false;

    //================================//
    protected m_twitchClient: tmi.Client;
    protected m_username: string;
    protected m_channels: string[];
    protected m_debug: boolean;

    //================================//
    protected m_numberOfIncomingMessages: number = 0;
    protected m_numberOfOutgoingMessages: number = 0;
    protected m_totalIncomingSize: number = 0.0;
    protected m_totalOutgoingSize: number = 0.0;

    //================================//
    constructor( _username: string, _channels: string[], _debug: boolean = false) {
        this.m_username = _username;
        this.m_channels = _channels;
        this.m_debug = _debug;

        this.m_twitchClient = tmi.Client({
            options: { debug: this.m_debug },
            connection: {
                reconnect: true,
                secure: true,
                reconnectInterval: this.reconnectInterval,
                maxReconnectAttempts: 100
            },
            identity: {
                username: this.m_username,
                password: ''
            },
            channels: this.m_channels
        });
    }

    //================================//
    public getTwitchClient(): tmi.Client {
        return this.m_twitchClient;
    }

    //================================//
    protected onCorrectConnection(): void {
        console.log(chalk.green('Connected to Twitch with username'));
    }

    //================================//
    public initializeConnection(): void {
        let tokenData = MyTokenManager.GetCurrentToken();

        if (tokenData === null) {
            console.error(chalk.red('Token data is null.'));
            return;
        }

        this.m_twitchClient = tmi.Client({
            options: { debug: this.m_debug },
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username: this.m_username,
                password: `oauth:${tokenData.access_token}`
            },
            channels: this.m_channels
        });

        //this.registerEventListeners();

        this.m_twitchClient.connect()
            .then(() => {
                this.onCorrectConnection();
            })
            .catch((error: any) => {
                console.error(chalk.red('Error connecting to Twitch: ', error));
                //this.scheduleReconnect();
            });
    }

    //================================//
    private registerEventListeners(): void {
        this.m_twitchClient.on('disconnected', (reason: string) => {
            console.error(chalk.red(`Disconnected: ${reason}.`));
            this.scheduleReconnect();
        });

        this.m_twitchClient.on('reconnect', () => {
            console.log(chalk.yellow('Attempting to reconnect now...'));
        });
    }

    //================================//
    private scheduleReconnect(): void {
        if (this.isReconnecting) return;

        this.isReconnecting = true;
        console.log(chalk.yellow(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`));

        setTimeout(() => {
            this.isReconnecting = false;
            console.log(chalk.blue('Retrying connection...'));
            this.initializeConnection();
        }, this.reconnectInterval);
    }

    //================================//
    public getUsageInformation(): string {
        //transform bytes to MB
        const totalincomingMB = (this.m_totalIncomingSize / 1024.0 / 1024.0).toFixed(3);
        const totaloutgoingMB = (this.m_totalOutgoingSize / 1024.0 / 1024.0).toFixed(3);

        return `Twitch Incoming Messages: ${this.m_numberOfIncomingMessages} with size ${totalincomingMB} MB | Twitch Outgoing Messages: ${this.m_numberOfOutgoingMessages} with size ${totaloutgoingMB} MB`;
    }
}