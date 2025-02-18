import tmi from 'tmi.js';
import chalk from 'chalk';
import { MyTokenManager } from './MyTokenManager.js';

//================================//
export class TwitchIRCSocket {
    protected m_twitchClient: tmi.Client;
    protected m_username: string;
    protected m_channels: string[];
    protected m_debug: boolean;

    //================================//
    constructor( _username: string, _channels: string[], _debug: boolean = false) {
        this.m_username = _username;
        this.m_channels = _channels;
        this.m_debug = _debug;

        this.m_twitchClient = tmi.Client({
            options: { debug: this.m_debug },
            connection: {
                reconnect: true,
                secure: true
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

        this.m_twitchClient.connect()
            .then(() => {
                this.onCorrectConnection();
            })
            .catch((error: any) => {
                console.error(chalk.red('Error connecting to Twitch: ', error));
            });
    }
}