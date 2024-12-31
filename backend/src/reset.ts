import 'dotenv/config';
import { BaseExpressApp } from './Middlewares/BaseExpressApp.js';
import { Request, Response } from 'express';
import axios from 'axios';
import open from 'open';
import { MyTokenManager } from './Services/MyTokenManager.js';
import { TokenData } from './Interfaces/TokenInterfaces.js';
import chalk from 'chalk';

//------------Members-------------//
const PORT = '3001';
const MyApp = new BaseExpressApp(PORT, false);

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}`;
const OAUTH_URL = `https://id.twitch.tv/oauth2/authorize`;

//================================//
if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Twitch Client ID or Secret is not defined in environment variables.');
}

//================================//
const HandleCodeRequest = async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;

    if (!code) {
        res.status(400).send('Authorization code not found.');
        console.error('Authorization code not found.');
        return;
    }

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            },
        });

        const { access_token, refresh_token, expires_in } = response.data as {
            access_token: string;
            refresh_token: string;
            expires_in: number;
        };

        res.send(`Access token: ${access_token}<br>Refresh token: ${refresh_token}<br> Expires in ${expires_in} `);

        const expires_at = new Date(new Date().getTime() + expires_in * 1000);

        let tokenData: TokenData = {expires_at: expires_at, access_token: access_token, refresh_token: refresh_token};

        MyTokenManager.SimpleTokenChange(process.env.DB_USER!, process.env.DB_HOST!, process.env.DB_NAME!, process.env.DB_PASSWORD!, parseInt(process.env.DB_PORT!), tokenData).then((result: boolean) => {
            if (result) {
                console.log(chalk.green("Success"));
            } else {
                console.log(chalk.green("Failed to request change to database"));
            }
            
            console.log(chalk.yellow('DONE'));
            process.exit(0);
        });

        
    } catch (error) {
        console.error('Failed to exchange authorization code for access token:', error);
        res.status(500).send('Failed to exchange authorization code for access token.');
    }
};

MyApp.AddGetRoute('/', HandleCodeRequest);

//================================//
const ListenCodeRequest = async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Automatically open the Twitch OAuth2 URL in the default browser
    const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=chat:read chat:edit user:read:subscriptions channel:read:vips`;
    console.log('Opening browser for authorization...');
    await open(authUrl);
}

MyApp.AddListenRoute(PORT, ListenCodeRequest);