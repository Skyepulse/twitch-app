import { DatabaseConnectionEndpoint } from "./DatabaseConnectionEndpoint.js";
import { UserInfo, FullUserInfo, UserClicks } from "../Interfaces/DataBaseInterfaces.js";
import chalk from "chalk";
import internal from "node:stream";

//================================//
export class MyTwitchDBEndpoint extends DatabaseConnectionEndpoint {
    private static instance: MyTwitchDBEndpoint;

    //================================//
    private constructor(user: string, _host: string, _database: string, _password: string, _port: number) {
        if (MyTwitchDBEndpoint.instance !== undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance already exists.'));
            return;
        }
        
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
    private async addClicks(_id: string, _clicks: number): Promise<boolean> {
        const query = `UPDATE base_clicks SET click_count = click_count + ${_clicks} WHERE user_id = '${_id}';`;
        try {
            await this.queryDatabase(query);
            return true;
        } catch (error: any) {
            console.error(chalk.red('Error adding clicks: ', error));
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

    //================================//
    public static async RegisterUser(_name: string, _id: string, _baseClickCount: number): Promise<number> {
        // Check if his ID is already in the database
        MyTwitchDBEndpoint.GetUserClicks(_id).then((clicks) => {
            if (clicks.user_id === -1) {
                // If not, add him
                MyTwitchDBEndpoint.AddUser(_name, _id, _baseClickCount).then((result) => {
                    if (result) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
            } else {
                return 0;
            }
        });
        return -1;
    }

    //================================//
    public static async AddClick(_id: string, _clicks: number): Promise<number> {
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return -1;
        }
        MyTwitchDBEndpoint.instance.getUserClicks(_id).then((clicks) => {
            if (clicks.user_id === -1) {
                return 0;
            }
            MyTwitchDBEndpoint.instance.addClicks(_id, _clicks).then((result) => {
                if (result) {
                    return 1;
                } else {
                    return -1;
                }
            });
        });
        return -1;
    }

    //================================//
    public static async UnregisterUser(_id: string): Promise<number> {
        if (MyTwitchDBEndpoint.instance === undefined) {
            console.error(chalk.red('MyTwitchDBEndpoint instance is undefined'));
            return -1;
        }
        MyTwitchDBEndpoint.instance.getUserClicks(_id).then((clicks) => {
            if (clicks.user_id === -1) {
                return 0;
            }
            MyTwitchDBEndpoint.AddClick('1', clicks.click_count);
            MyTwitchDBEndpoint.RemoveUser(_id).then((result) => {
                if (result) {
                    return 1;
                } else {
                    return -1;
                }
            });
        });
        return -1;
    }
    
}
        