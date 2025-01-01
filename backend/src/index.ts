import 'dotenv/config';
import { BaseExpressApp } from './Middlewares/BaseExpressApp.js';
import { MyServer } from './Services/MyServer.js';
import { MyTwitchChat } from './Services/MyTwitchChat.js';
import { MyTwitchDBEndpoint } from './Services/MyTwitchDBEndpoint.js';
import { MyTokenManager } from './Services/MyTokenManager.js';

import { BuyableBonusData } from './Models/Gameplay/BuyableBonusData.js';
import chalk from 'chalk';
import { IT_AutoClicker } from './Interfaces/GameplayObjects/AutoClickers.js';

//------------Members-------------//
const PORT = process.env.PORT || '5000';
const MyApp: BaseExpressApp = new BaseExpressApp(PORT);
const SocketServer: MyServer = new MyServer(MyApp.server, 'http://localhost:3000');

const TwitchClient: MyTwitchChat = new MyTwitchChat(process.env.TWITCH_USERNAME!, [process.env.TWITCH_CHANNEL!], false);

function Init(): void {
    TwitchClient.addListenerServer(SocketServer);

    MyTwitchDBEndpoint.Init(process.env.DB_USER!, process.env.DB_HOST!, process.env.DB_NAME!, process.env.DB_PASSWORD!, parseInt(process.env.DB_PORT!));
    MyTokenManager.Init(process.env.DB_USER!, process.env.DB_HOST!, process.env.DB_NAME!, process.env.DB_PASSWORD!, parseInt(process.env.DB_PORT!)).then((result: boolean) => {
        if (result) {
            TwitchClient.initializeConnection();
        }
    });

    BuyableBonusData.initialize('./src/Config/Bonuses.json');

    console.log(chalk.blue(BuyableBonusData.getBonusLevels<IT_AutoClicker>(1, 2)?.duration));
}

Init();