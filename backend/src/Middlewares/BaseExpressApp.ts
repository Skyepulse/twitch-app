import express from 'express';
import http from 'http';
import chalk from 'chalk';

//================================//
export class BaseExpressApp {
    public app: express.Application;
    public server: http.Server | undefined;
    
    //================================//
    constructor(_PORT: string, _hasServer: boolean = true) {
        this.app = express();
        this.app.use(express.json());

        if (_hasServer) {
            this.server = http.createServer(this.app);
            this.initializeServer(_PORT);
        }
    }

    //================================//
    private initializeServer( _PORT: string): void {
        if (!this.server) return;
        this.server.listen(_PORT, () => {
            console.log(chalk.green('Server running on port' + _PORT));
        });
    }

    //================================//
    public AddGetRoute(_route: string, _callback: (req: express.Request, res: express.Response) => void): void {
        this.app.get(_route, _callback);
    }

    //================================//
    public AddListenRoute(_route: string, _callback: () => void): void {
        this.app.listen(_route, _callback);
    }
}