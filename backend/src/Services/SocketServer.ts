//================================//
export abstract class SocketServer{
    //================================//
    protected m_numberOfIncomingMessages: number = 0;
    protected m_numberOfOutgoingMessages: number = 0;
    protected m_totalIncomingSize: number = 0.0;
    protected m_totalOutgoingSize: number = 0.0;

    //================================//
    abstract SendMessage(_id: string, _event: string, _data: any): void;

    //================================//
    abstract BroadcastMessage(_event: string, _data: any): void;

    //================================//
    abstract AmIConnected(): boolean;

    //================================//
    public getUsageInformation(): string {
        const MBIncoming = (this.m_totalIncomingSize / 1024 / 1024).toFixed(3);
        const MBOutgoing = (this.m_totalOutgoingSize / 1024 / 1024).toFixed(3);
        return `Fom single socket server, Incoming messages: ${this.m_numberOfIncomingMessages}, Outgoing messages: ${this.m_numberOfOutgoingMessages}, Incoming size: ${MBIncoming} MB, Outgoing size: ${MBOutgoing} MB`;
    }
}