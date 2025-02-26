import os from "os";
import { TwitchIRCSocket } from "../Services/TwitchIRCSocket";
import { SingleSocketServer } from "../Services/SingleSocketServer";
import { DatabaseConnectionEndpoint } from "../Services/DatabaseConnectionEndpoint";

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

        const runMonitoring = async () => {
            while (this.running) {
                await new Promise(resolve => setTimeout(resolve, 300000)); // Wait 5 minutes

                const { totalBytesSent, totalBytesReceived } = this.getNetworkUsage();
                let string = '';
                
                for (const server of IRCServers) {
                    string += await server.getUsageInformation() + ' | ';
                }
                for (const server of SocketServers) {
                    string += await server.getUsageInformation() + ' | ';
                }
                for (const endpoint of DatabaseEndpoints) {
                    string += await endpoint.getUsageInformation() + ' | ';
                }

                console.log(`Total Bandwidth - Sent: ${totalBytesSent} bytes, Received: ${totalBytesReceived} bytes | ${string}`);
            }
        };

        runMonitoring();
    }
    
    //================================//
    public static Stop(): void {
        this.running = false;
    }
}
