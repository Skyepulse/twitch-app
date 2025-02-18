import { TokenData } from '../Interfaces/TokenInterfaces.js';
import { DatabaseConnectionEndpoint } from './DatabaseConnectionEndpoint.js';
import axios from 'axios';
import chalk from "chalk";

//================================//
export class MyTokenManager extends DatabaseConnectionEndpoint{
    private static instance: MyTokenManager;
    private TokenData: TokenData | null = null;
    private static TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
    private static REFRESH_LIMIT = 600000; // 10 minutes


    //================================//
    private constructor(user: string, _host: string, _database: string, _password: string, _port: number) {
        if (MyTokenManager.instance !== undefined) {
            console.error(chalk.red('MyTokenManager instance already exists.'));
            return;
        }

        super(user, _host, _database, _password, _port);
    };

    //================================//
    private async InitialTokenFetch(): Promise<boolean> {
        let tokenData = await this.GetTokenData();
        if (tokenData === null) {
            console.error(chalk.red('There is no token data in the database.'));
            return false;
        }

        this.TokenData = tokenData;
        return true;
    }

    //================================//
    private async GetTokenData(): Promise<TokenData | null> {
        const query = `SELECT access_token, refresh_token, expires_at FROM base_tokens LIMIT 1;`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows[0];
        } catch (error: any) {
            console.error(chalk.red('Error getting token data: ', error));
            return null;
        }
    }

    //================================//
    public static async UpdateTokenData(_tokenData: TokenData): Promise<boolean> {
        const formattedExpiresAt = _tokenData.expires_at.toISOString().replace('T', ' ').replace('Z', '');
        const query = `UPDATE base_tokens SET access_token = '${_tokenData.access_token}', refresh_token = '${_tokenData.refresh_token}', expires_at = '${formattedExpiresAt}' WHERE id = 1;`;
        try {
            await MyTokenManager.instance.queryDatabase(query);
            return true;
        } catch (error: any) {
            console.error(chalk.red('Error updating token data: ', error));
            return false;
        }
    }

    //================================//
    public static GetCurrentToken(): TokenData | null {
        return MyTokenManager.instance.TokenData;
    }

    //================================//
    public static async SimpleTokenChange(user: string, _host: string, _database: string, _password: string, _port: number, _tokenData: TokenData): Promise<boolean> {
        if (MyTokenManager.instance === undefined) 
            {
            MyTokenManager.instance = new MyTokenManager(user, _host, _database, _password, _port);
            
            try
            {
                console.log(chalk.yellow('Token manager initialized. Trying to update token data...'));
                return await MyTokenManager.UpdateTokenData(_tokenData);
            } catch (error: any) {
                console.error(chalk.red('Error initializing token manager: ', error));
                return false;
            }
        }
        return false;
    };

    //================================//
    public static async Init(user: string, _host: string, _database: string, _password: string, _port: number): Promise<boolean> {
        if (MyTokenManager.instance === undefined) {
            MyTokenManager.instance = new MyTokenManager(user, _host, _database, _password, _port);

            try {
                const initialFetchResult = await MyTokenManager.instance.InitialTokenFetch();
                if (!initialFetchResult) {
                    console.error(chalk.red('Error initializing token manager.'));
                    return false;
                }

                console.log(chalk.green('Token manager initialized.'));

                const refreshResult = await MyTokenManager.instance.refreshAccessToken();
                if (!refreshResult) {
                    console.error(chalk.red('Error refreshing access token.'));
                    return false;
                }

                console.log(chalk.green('Access token refreshed.'));
                this.instance.setRefreshScheduler(this.instance.TokenData?.expires_at);
                return true;
            } catch (error: any) {
                console.error(chalk.red('Error initializing token manager: ', error));
                return false;
            }
        }

        return false;
    }

    //================================//
    private async refreshAccessToken(): Promise<boolean> {
    
        if (!this.TokenData || !this.TokenData.refresh_token) {
            throw new Error('No refresh token found in database.');
        }
    
        const params = new URLSearchParams();
        params.append('client_id', process.env.TWITCH_CLIENT_ID || '');
        params.append('client_secret', process.env.TWITCH_SECRET || '');
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', this.TokenData.refresh_token);
    
        const response = await axios.post<{ access_token: string, refresh_token: string, expires_in: number }>(MyTokenManager.TWITCH_TOKEN_URL, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (response.status !== 200) {
            console.error(chalk.red('Error refreshing access token: ', response.data));
            return false;
        }
    
        const { access_token, refresh_token, expires_in } = response.data;
        const expires_at = new Date(new Date().getTime() + expires_in * 1000);

        let newTokenData: TokenData = {
            access_token,
            refresh_token,
            expires_at
        };

        this.TokenData = newTokenData;

        return await MyTokenManager.UpdateTokenData(newTokenData);
    }

    //================================//
    private setRefreshScheduler(_expires_at: Date | undefined): void {
        if (!_expires_at) {
            console.error(chalk.red('No expires_at date found.'));
            return;
        }

        const refreshInterval = _expires_at.getTime() - Date.now() - MyTokenManager.REFRESH_LIMIT;

        if (refreshInterval <= 0) {
            console.log(chalk.yellow('Token about to expire, trying to refresh now...'));
            return;
        } else {
            console.log(chalk.green(`Token refresh scheduled in ${refreshInterval / 1000} seconds.`));
            setTimeout(async () => {
                await this.refreshAccessToken();
                if (this.TokenData) {
                    this.setRefreshScheduler(this.TokenData.expires_at);
                }
            }, refreshInterval);
        }
    }
}