import 'dotenv/config';
import { BaseExpressApp } from './Middlewares/BaseExpressApp.js';
import { MyServer } from './Services/MyServer.js';
import { MyTwitchChat } from './Services/MyTwitchChat.js';
import { MyTwitchDBEndpoint } from './Services/MyTwitchDBEndpoint.js';
import { MyTokenManager } from './Services/MyTokenManager.js';

import { BuyableBonusData } from './Models/Gameplay/BuyableBonusData.js';
import { CheckPointsData } from './Models/Gameplay/CheckPointsData.js';
import NetworkUsageInterface from './Middlewares/NetworkUsageInterface.js';

import chalk from 'chalk';
import { Request, Response } from 'express';

//------------Members-------------//
const PORT = process.env.PORT || '5000';
const MyApp: BaseExpressApp = new BaseExpressApp(PORT);
MyApp.AddGetRoute('/api/test', (_req: Request, res: Response) => {
    res.send({ message: "Reverse proxy works with API!" });
});
const SocketServer: MyServer = new MyServer(MyApp.server, "*");

//================================//
const TwitchClient: MyTwitchChat = new MyTwitchChat(process.env.TWITCH_USERNAME!, [process.env.TWITCH_CHANNEL!], false);

//================================//
function Init(): void {
    TwitchClient.addListenerServer(SocketServer);

    //================================//
    BuyableBonusData.initialize('./src/Config/Bonuses.json');
    CheckPointsData.initialize('./src/Config/CheckPoints.json');

    //================================//
    MyTwitchDBEndpoint.Init(process.env.DB_USER!, process.env.DB_HOST!, process.env.DB_NAME!, process.env.DB_PASSWORD!, parseInt(process.env.DB_PORT || '5432'));
    MyTokenManager.Init(process.env.DB_USER!, process.env.DB_HOST!, process.env.DB_NAME!, process.env.DB_PASSWORD!, parseInt(process.env.DB_PORT!)).then((result: boolean) => {
        if (result) {
            TwitchClient.initializeConnection();
        }
    });

    (async () => {
        console.log(chalk.yellowBright("Network Usage Interface is initializing..."));
        await NetworkUsageInterface.Init([TwitchClient], [SocketServer], [MyTwitchDBEndpoint.instance]);
    })();
}

//================================//
Init();