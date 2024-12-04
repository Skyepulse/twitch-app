import express from 'express';
import http from 'http';
import chalk from 'chalk';

//================================//
export class BaseExpressApp {
    public app: express.Application;
    public server: http.Server;
    
    //================================//
    constructor(_PORT: string) {
        this.app = express();
        this.app.use(express.json());

        this.server = http.createServer(this.app);
        this.initializeServer(_PORT);
    }

    //================================//
    private initializeServer( _PORT: string): void {
        this.server.listen(_PORT, () => {
            console.log(chalk.green('Server running on port' + _PORT));
        });
    }
}