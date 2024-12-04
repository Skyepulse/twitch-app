import 'dotenv/config';
import { BaseExpressApp } from './Middlewares/BaseExpressApp';
import { MyServer } from './Services/MyServer';
import { MyTwitchChat } from './Services/MyTwitchChat';

//------------Members-------------//
const PORT = process.env.PORT || '5000';
const MyApp: BaseExpressApp = new BaseExpressApp(PORT);
const SocketServer: MyServer = new MyServer(MyApp.server, 'http://localhost:3000');
const TwitchClient: MyTwitchChat = new MyTwitchChat(process.env.TWITCH_USERNAME!, process.env.TWITCH_OAUTH_TOKEN!, [process.env.TWITCH_CHANNEL!], true);

function Init(): void {
    TwitchClient.addListenerServer(SocketServer);
}

Init();