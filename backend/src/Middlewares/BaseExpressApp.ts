import express from 'express';
import http from 'http';
import chalk from 'chalk';

//================================//
export class BaseExpressApp {
    public app: express.Application;
    public server: http.Server | undefined;
    
    //================================//
    constructor(_PORT: string, _hasServer: boolean = true) {
        console.log("🚀 Initializing Express App on port ..." + _PORT);
        this.app = express();
        this.app.use(express.json());

        if (_hasServer) {
            this.app.get("/", (req, res) => {
                res.send("✅ Server is running!");
            });
            this.server = http.createServer(this.app);
            this.initializeServer(_PORT);
            console.log("Server initialized: ", this.server !== undefined);
        }
    }

    //================================//
    private initializeServer( _PORT: string): void {
        if (!this.server) return;

        this.server.listen(Number(_PORT), () => {
            console.log(chalk.green(`✅ Server running on port ${_PORT}`));
        });

        this.server.on('listening', () => {
            console.log("✅ HTTP Server is fully started!");
        });
    }

    //================================//
    public AddGetRoute(_route: string, _callback: (req: express.Request, res: express.Response) => void): void {
        this.app.get(_route, _callback);
    }

    //================================//
    public AddListenRoute(_route: string, _callback: () => void): void {
        this.app.listen(Number(_route), '0.0.0.0', _callback);
    }
}