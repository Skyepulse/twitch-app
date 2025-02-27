import os from "os";
import fs from "fs";
import { TwitchIRCSocket } from "../Services/TwitchIRCSocket";
import { SingleSocketServer } from "../Services/SingleSocketServer";
import { DatabaseConnectionEndpoint } from "../Services/DatabaseConnectionEndpoint";
import chalk from "chalk";
import path from "path";

//================================//    
interface NetworkStats {
    totalBytesSent: number;
    totalBytesReceived: number;
}

//================================//
export default class NetworkUsageInterface {
    private static intervalId: NodeJS.Timeout;
    private static running: boolean = false;

    //================================//
    private static currentFileName: string = '';

    //================================//
    private static getNetworkUsage(): NetworkStats {
        const nets = os.networkInterfaces();
        let totalBytesSent = 0, totalBytesReceived = 0;

        Object.values(nets).forEach((net) => {
            if (net) {
                net.forEach((iface) => {
                    // Not all interfaces provide these properties, so default to 0
                    const txBytes = (iface as any).tx_bytes;
                    const rxBytes = (iface as any).rx_bytes;
                    if (typeof txBytes === 'number' && typeof rxBytes === 'number') {
                        totalBytesSent += txBytes;
                        totalBytesReceived += rxBytes;
                    }
                });
            }
        });

        return { totalBytesSent, totalBytesReceived };
    }

    //================================//
    public static async Init(
        IRCServers: TwitchIRCSocket[], 
        SocketServers: SingleSocketServer[], 
        DatabaseEndpoints: DatabaseConnectionEndpoint[]
    ): Promise<void> {
        if (this.running) return; // Prevent multiple intervals
        this.running = true;

        //Look at folder UsageLogs, create it if it doesn't exist
        const logPath = path.join(process.cwd(), 'UsageLogs');
        if (!fs.existsSync(logPath)) {
            try 
            {
                fs.mkdirSync(logPath);
                console.log(chalk.cyan(`UsageLogs folder created at ${logPath}`));
            }
            catch (error)
            {
                console.error(chalk.red(`Error creating UsageLogs folder at ${logPath}`));
                return;
            }
        } else
        {
            console.log(chalk.cyan(`UsageLogs folder already exists at ${logPath}`));
        }

        //Write the network usage to a file
        this.currentFileName = path.join(logPath, `Backend-NetworkUsage-${new Date().toISOString().replace(/:/g, '-')}.log`);
        this.writeToLogFile('--------------------------------------------\n');

        const runMonitoring = async () => {
            while (this.running) {
                await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 5 minutes

                const { totalBytesSent, totalBytesReceived } = this.getNetworkUsage();
                let string = '';
                
                for (const server of IRCServers) {
                    const info = await server.getUsageInformation();
                    string += `${info} | `;
                }
                for (const server of SocketServers) {
                    const info = await server.getUsageInformation();
                    string += `${info} | `;
                }
                for (const endpoint of DatabaseEndpoints) {
                    const info = await endpoint.getUsageInformation();
                    string += `${info} | `;
                }

                const MBsent = (totalBytesSent / 1024 / 1024).toFixed(3);
                const MBreceived = (totalBytesReceived / 1024 / 1024).toFixed(3);
                //console.log(chalk.yellowBright(`Total Bandwidth - Sent: ${MBsent} MB, Received: ${MBreceived} MB | ${string}`));
                this.writeToLogFile(`${new Date().toISOString()} - Total Bandwidth - Sent: ${MBsent} MB, Received: ${MBreceived} MB | ${string}\n`);
                this.writeToLogFile('--------------------------------------------\n');
            }
        };

        runMonitoring();
    }
    
    //================================//
    public static Stop(): void {
        this.running = false;
    }

    //================================//
    private static writeToLogFile(data: string): void {
        try 
        {
            fs.appendFileSync(this.currentFileName, data);
        }
        catch (error)
        {
            console.error(chalk.red(`Error writing to UsageLog file ${this.currentFileName}`));
        }
    }
}
