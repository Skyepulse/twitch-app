import { DatabaseConnectionEndpoint } from "./DatabaseConnectionEndpoint.js";
import { UserInfo, FullUserInfo, UserClicks } from "../Interfaces/DataBaseInterfaces.js";
import chalk from "chalk";

//================================//
export class MyTwitchDBEndpoint extends DatabaseConnectionEndpoint {
    private static instance: MyTwitchDBEndpoint;

    //================================//
    private constructor(user: string, _host: string, _database: string, _password: string, _port: number) {
        super(user, _host, _database, _password, _port);
    };

    //================================//
    private async addUser(_name: string, _id: string, _baseClickCount: number): Promise<boolean> {
        const query = `INSERT INTO base_clicks (user_id, username, click_count) VALUES ('${_id}', '${_name}', ${_baseClickCount});`;
        try {
            await this.queryDatabase(query);
            return true;
        } catch (error: any) {
            console.error(chalk.red('Error adding user: ', error));
            return false;
        }
    }

    //================================//
    private async getUsersInfo(): Promise<UserInfo[]> {
        const query = `SELECT user_id, username FROM base_clicks;`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows;
        } catch (error: any) {
            console.error(chalk.red('Error getting users info: ', error));
            return [];
        }
    }

    //================================//
    private async getFullUsersInfo(): Promise<FullUserInfo[]> {
        const query = `SELECT user_id, username, click_count FROM base_clicks;`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows;
        } catch (error: any) {
            console.error(chalk.red('Error getting full user info: ', error));
            return [];
        }
    }

    //================================//
    private async getUserClicks(_id: string): Promise<UserClicks> {
        const query = `SELECT user_id, click_count FROM base_clicks WHERE user_id = '${_id}';`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows[0];
        } catch (error: any) {
            console.error(chalk.red('Error getting user clicks: ', error));
            return { user_id: -1, click_count: -1 };
        }
    }

    //================================//
    private async getUserName(_id: string): Promise<string> {
        const query = `SELECT username FROM base_clicks WHERE user_id = '${_id}';`;
        try {
            const result = await this.queryDatabase(query);
            return result.rows[0].username;
        } catch (error: any) {
            console.error(chalk.red('Error getting user name: ', error));
            return '';
        }
    }

    //================================//
    private async removeUser(_id: string): Promise<boolean> {
        const query = `DELETE FROM base_clicks WHERE user_id = '${_id}';`;
        try {
            await this.queryDatabase(query);
            return true;
        } catch (error: any) {
            console.error(chalk.red('Error removing user: ', error));
            return false;
        }
    }

    //================================//
    public static RemoveUser(_id: string): Promise<boolean> {  
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return new Promise((resolve, reject) => { resolve(false) });
        }    
        return MyTwitchDBEndpoint.instance.removeUser(_id);
    }

    //================================//
    public static GetUserName(_id: string): Promise<string> {
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return new Promise((resolve, reject) => { resolve('') });
        }
        return MyTwitchDBEndpoint.instance.getUserName(_id);
    }

    //================================//
    public static GetUserClicks(_id: string): Promise<UserClicks> {
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return new Promise((resolve, reject) => { resolve({ user_id: -1, click_count: -1 }) });
        }
        return MyTwitchDBEndpoint.instance.getUserClicks(_id);
    }

    //================================//
    public static GetFullUsersInfo(): Promise<FullUserInfo[]> {
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return new Promise((resolve, reject) => { resolve([]) });
        }
        return MyTwitchDBEndpoint.instance.getFullUsersInfo();
    }

    //================================//
    public static GetUsersInfo(): Promise<UserInfo[]> {
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return new Promise((resolve, reject) => { resolve([]) });
        }
        return MyTwitchDBEndpoint.instance.getUsersInfo();
    }

    //================================//
    public static AddUser(_name: string, _id: string, _baseClickCount: number): Promise<boolean> {
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return new Promise((resolve, reject) => { resolve(false) });
        }
        return MyTwitchDBEndpoint.instance.addUser(_name, _id, _baseClickCount);
    }

    //================================//
    public static Init(user: string, _host: string, _database: string, _password: string, _port: number): void {
        if (MyTwitchDBEndpoint.instance === undefined) {
            MyTwitchDBEndpoint.instance = new MyTwitchDBEndpoint(user, _host, _database, _password, _port);
        }
    }
}
        