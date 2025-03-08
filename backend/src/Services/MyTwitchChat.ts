import EventSystem from "../Middlewares/EventSystem.js";
import { CheckPointsData } from "../Models/Gameplay/CheckPointsData.js";
import { MazeManager } from "./GamePlay/MazeManager.js";
import { MyTwitchDBEndpoint } from "./MyTwitchDBEndpoint.js";
import { SingleSocketServer } from "./SingleSocketServer.js";
import { TwitchIRCSocket } from "./TwitchIRCSocket.js";
import chalk from "chalk";

//================================//
export class MyTwitchChat extends TwitchIRCSocket {
    private ListeningSocketServers  : SingleSocketServer[] = [];

    //================================//
    private currentTotalClicks: number = 0;

    //==============TIMERS==================//
    private readonly UPDATE_INTERVAL: number = 50;

    private readonly updateMaze: number = MazeManager.REQUEST_MOVE_TIME * 1000;
    private updateMazeTimer: number = MazeManager.REQUEST_MOVE_TIME * 1000;

    private readonly mazeResetRefreshTime: number = 1000 * 15; // 15 Seconds
    private mazeResetTimer: number = 0;

    private B_refreshClicks: boolean = false;
    private B_refreshMaze: boolean = false;

    private timeSinceLaunch: number = 0;
    private isRunning: boolean = true;
    private realStartTime: number = performance.now();

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

        this.startUpdateLoop();
        EventSystem.Subscribe('click-added', this.onClickAdded.bind(this));
        EventSystem.Subscribe('new-client-connected', this.onNewClientConnected.bind(this));
    }

    //================================//
    private startUpdateLoop(): void {
        const loop = () => {
            if (!this.isRunning) return;

            const now = performance.now();
            const delta = now - this.realStartTime; // Correct calculation
            this.realStartTime = now;

            this.Update(delta);

            setTimeout(loop, Math.max(0, this.UPDATE_INTERVAL - delta)); // Adjust interval to prevent drift
        };

        loop();
    }

    //================================//
    public stopUpdateLoop(): void {
        this.isRunning = false;
    }

    //================================//
    public Update(delta: number): void {

        //Update total clicks
        if (this.B_refreshClicks) {
            this.SendTotalClicks();
            this.sendTopClickers();
        }

        //Update grid and position
        if ( CheckPointsData.HasCheckPoint( 'Maze', this.currentTotalClicks ))
        {
            if ( this.mazeResetTimer > 0 )
            {
                this.mazeResetTimer -= delta;
                if (this.mazeResetTimer <= 0)
                {
                    this.updateMazeTimer = this.updateMaze;
                    MazeManager.ResetMaze(5, 4);
                    this.B_refreshMaze = true;
                }
            } 
            else 
            {
                if (this.updateMazeTimer < this.updateMaze) {
                    this.updateMazeTimer += delta;
                } else {
                    this.updateMazeTimer = 0;
                    const hadUpdate = MazeManager.UpdateRequests();
    
                    if (hadUpdate) {
                        this.B_refreshMaze = true;
                    }
    
                    const { b, won } = MazeManager.HasMaze();
                    if (!b){
                        MazeManager.ResetMaze(5, 4);
                        this.B_refreshMaze = true;
                    } else if (won) {
                        this.mazeResetTimer = this.mazeResetRefreshTime;
                    }
                }
            }
        }

        //Update send maze info
        if (this.B_refreshMaze) {
            const { b, won } = MazeManager.HasMaze();
            this.sendGridAndPosition(won);
        }
    }

    //================================//
    private onClickAdded(): void {
        this.B_refreshClicks = true;
    }

    //================================//
    private onNewClientConnected(): void {
        this.B_refreshClicks = true;
        this.B_refreshMaze = true;
    }

    //================================//
    public override onCorrectConnection(): void {
        super.onCorrectConnection();
        this.SendChatMessage(this.m_channels[0], 'Hello! I am alive!');
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
    private CanSendToSocketServers(): boolean {
        //Look for each listening socket server if one of them returns true on AmIConnected()
        for (let i = 0; i < this.ListeningSocketServers.length; i++) {
            if (this.ListeningSocketServers[i].AmIConnected()) {
                return true;
            }
        }
        return false;
    }

    //================================//
    private SendTotalClicks(){
        if (!this.CanSendToSocketServers()) return;

        this.B_refreshClicks = false;

        MyTwitchDBEndpoint.GetTotalClicks().then((result) => {
            if (result === -1) {
                console.error(chalk.red('Error getting total clicks!'));
            } else {
                this.ListeningSocketServers.forEach(server => {
                    server.SendMessage('total-clicks', { totalClicks: result });
                });
                this.currentTotalClicks = result;
            }
        });
    }   

    //================================//
    private sendGridAndPosition(win: boolean): void {
        if (!this.CanSendToSocketServers()) return;

        const mazeInfo = MazeManager.GetMazeInfo();
        if (mazeInfo) {
            this.B_refreshMaze = false;
            const { grid, start, end, playerPos } = mazeInfo;
            this.ListeningSocketServers.forEach(server => {
                server.SendMessage('maze-data', { grid: grid, position: playerPos, win: win});
            });
        }
    }

    //================================//
    private sendTopClickers(): void {
        if (!this.CanSendToSocketServers()) return;

        MyTwitchDBEndpoint.GetTopNClickers().then((result) => {
            if (result === null) {
                console.error(chalk.red('Error getting top clickers!'));
            } else {
                if (result.length !== 0) {
                    // slice between n_low and n_high and add a position to each element starting from n_low + 1 to n_high + 1
                    let topClickers: { position: number, user_id: number, username: string, click_count: number }[] = [];
                    for (let i = 0; i < result.length; i++) {
                        topClickers.push({ position: i + 1, user_id: result[i].user_id, username: result[i].username, click_count: result[i].click_count });
                    }
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

            this.m_numberOfOutgoingMessages++;
            this.m_totalOutgoingSize += Buffer.byteLength(_message, 'utf8');
            
        } catch (error: any) {
            console.error(chalk.red('Error sending message: ', error));
        }
    }

    //================================//
    protected onReceivedTwitchMessage(_channel: string, _tags: any, _message: string, _self: boolean): void {
        this.m_numberOfIncomingMessages++;
        this.m_totalIncomingSize += Buffer.byteLength(_message, 'utf8');
        
        if (_self) return;
        
        

        if (_message.startsWith('!')) {
            this.onReceivedCommand(_channel, _tags, _message);
        } else {
            this.ListeningSocketServers.forEach(server => {
                server.SendMessage('chat-message', { username: _tags.username, message: _message, channel: _channel });
            });
        }
    }

    //================================//
    protected onReceivedCommand(_channel: string, _tags: any, _message: string): void {
        const firstMessagePart = _message.split(' ')[0];
        switch (firstMessagePart) {
            case '!ping':
                this.SendChatMessage(_channel, `Pong! @${_tags.username}`);
                break;
            case '!hello':
                this.SendChatMessage(_channel, `Hello! @${_tags.username}`);
                break;
            case '!register':
                MyTwitchDBEndpoint.RegisterUser(_tags.username, _tags['user-id'], 0).then((result) => {
                    if (result === 1) {
                        this.SendChatMessage(_channel, `Registered @${_tags.username}`);
                    } else if (result === 0) {
                        this.SendChatMessage(_channel, `You are already registered @${_tags.username}`);
                    } else if (result === -1) {
                        this.SendChatMessage(_channel, `Error registering @${_tags.username}. We are sorry!`);
                    }
                });
                break;
            case '!click':
                MyTwitchDBEndpoint.AddClick(_tags['user-id'], 1).then((result) => {
                    if ( result === 0){
                        this.SendChatMessage(_channel, `You are not registered @${_tags.username}! Use !register to register!`);
                    } else if (result === -1) {
                        this.SendChatMessage(_channel, `There was an error registering your click... @${_tags.username}!`);
                    } else {
                        MyTwitchDBEndpoint.AddAutoClicker(_tags['user-id']);
                    }
                });
                break;
            case '!myClicks':
                MyTwitchDBEndpoint.GetUserClicks(_tags['user-id']).then((result) => {
                    if (result.user_id === -1) {
                        this.SendChatMessage(_channel, `You are not registered @${_tags.username}! Use !register to register!`);
                    } else {
                        this.SendChatMessage(_channel, `@${_tags.username} you have ${result.click_count} clicks!`);
                    }
                });
                break;
            case '!unregister':
                MyTwitchDBEndpoint.UnregisterUser(_tags['user-id']).then((result) => {
                    if (result === 1) {
                        this.SendChatMessage(_channel, `Unregistered @${_tags.username}`);
                    } else if (result === 0) {
                        this.SendChatMessage(_channel, `You are not registered @${_tags.username}! Use !register to register!`);
                    } else if (result === -1) {
                        this.SendChatMessage(_channel, `Error unregistering @${_tags.username}. We are sorry!`);
                    }
                });
                break;
            case '!upgrade':
                if (_message.replace(/\s+/g, '') === '!upgrade') 
                {
                    MyTwitchDBEndpoint.UpgradeBonusText(_tags['user-id']).then((result) => {
                        if (result) {
                            this.SendChatMessage(_channel, `@${_tags.username} Here is your upgrade options: ${result}`);
                        }
                });
                }
                else
                {
                    MyTwitchDBEndpoint.UpgradeBonus(_tags['user-id'], parseInt(_message.split(' ')[1], 10)).then((result) => {
                        if (result === 1) {
                            this.SendChatMessage(_channel, `Transaction completed! @${_tags.username}`);
                        } else if (result === 0) {
                            this.SendChatMessage(_channel, `You are not registered @${_tags.username}! Use !register to register!`);
                        } else if (result === -1) {
                            this.SendChatMessage(_channel, `Error upgrading bonus @${_tags.username}. We are sorry!`);
                        } else if (result === -2) {
                            this.SendChatMessage(_channel, `The bonus requested does not exist @${_tags.username}!`);
                        } else if (result === -3) {
                            this.SendChatMessage(_channel, `You do not have enough clicks @${_tags.username}!`);
                        }
                    });
                }
                break;
            case '!up':
                if (MazeManager.HasMaze().b) {
                    MazeManager.AddUp(_tags['user-id']);
                    break;
                }
            case '!down':
                if (MazeManager.HasMaze().b) {
                    MazeManager.AddDown(_tags['user-id']);
                    break;
                }
            case '!right':
                if (MazeManager.HasMaze().b) {
                    MazeManager.AddRight(_tags['user-id']);
                    break;
                }
            case '!left':
                if (MazeManager.HasMaze().b) {
                    MazeManager.AddLeft(_tags['user-id']);
                    break;
                }
            case '!help':
                const directions = MazeManager.HasMaze().b ? 'Use !up, !down, !right and !left if you can participate in the maze.' : '';
                this.SendChatMessage(_channel, `Available commands: !ping, !hello, !register, !click, !myClicks, !unregister, !upgrade, !help.` + directions);
                break;
            default:
                this.SendChatMessage(_channel, `The command ${_message} does not exist. Use !help to see the available commands.`);
                break;
        }
    }
}