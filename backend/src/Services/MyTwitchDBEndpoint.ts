import { DatabaseConnectionEndpoint } from "./DatabaseConnectionEndpoint";
import { UserInfo, FullUserInfo, UserClicks } from "../Interfaces/DataBaseInterfaces";
import chalk from "chalk";

//================================//
export class MyTwitchDBEndpoint extends DatabaseConnectionEndpoint {

    //================================//
    constructor(user: string, _host: string, _database: string, _password: string, _port: number) {
        super(user, _host, _database, _password, _port);
    };

    //================================//
    public async addUser(_name: string, _id: string, _baseClickCount: number): Promise<boolean> {
        const query = `INSERT INTO base_clicks (user_id, username, click_count) VALUES ('${_id}', '${_name}', ${_baseClickCount});`;
        try {
            await this.queryDatabase(query);
            return true;
        } catch (error) {
            console.error(chalk.red('Error adding user: ', error));
            return false;
        }
    }

    //================================//
    public async getUsersInfo(): Promise<UserInfo[]> {
        const query = `SELECT user_id, username FROM base_clicks;`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows;
        } catch (error) {
            console.error(chalk.red('Error getting users info: ', error));
            return [];
        }
    }

    //================================//
    public async getFullUsersInfo(): Promise<FullUserInfo[]> {
        const query = `SELECT user_id, username, click_count FROM base_clicks;`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows;
        } catch (error) {
            console.error(chalk.red('Error getting full user info: ', error));
            return [];
        }
    }

    //================================//
    public async getUserClicks(_id: string): Promise<UserClicks> {
        const query = `SELECT user_id, click_count FROM base_clicks WHERE user_id = '${_id}';`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows[0];
        } catch (error) {
            console.error(chalk.red('Error getting user clicks: ', error));
            return { user_id: -1, click_count: -1 };
        }
    }

    //================================//
    public async getUserName(_id: string): Promise<string> {
        const query = `SELECT username FROM base_clicks WHERE user_id = '${_id}';`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows[0].username;
        } catch (error) {
            console.error(chalk.red('Error getting user name: ', error));
            return '';
        }
    }

    //================================//
    public async removeUser(_id: string): Promise<boolean> {
        const query = `DELETE FROM base_clicks WHERE user_id = '${_id}';`;
        try {
            await this.queryDatabase(query);
            return true;
        } catch (error) {
            console.error(chalk.red('Error removing user: ', error));
            return false;
        }
    }
}
        