import tmi from 'tmi.js';
import chalk from 'chalk';

//================================//
export class TwitchIRCSocket {
    private m_twitchClient: tmi.Client;

    //================================//
    constructor( _username: string, _password: string, _channels: string[], _debug: boolean = false) {

        this.m_twitchClient = new tmi.Client({
            options: { debug: _debug },
            connection: {
                secure: true,
                reconnect: true,
            },
            identity: {
                username: _username,
                password: _password
            },
            channels: _channels
        });

        this.m_twitchClient.connect()
            .then(() => {
                console.log(chalk.green('Connected to Twitch'));
            })
            .catch((error: any) => {
                console.error(chalk.red('Error connecting to Twitch: ', error));
            });
    }

    //================================//
    public getTwitchClient(): tmi.Client {
        return this.m_twitchClient;
    }
}