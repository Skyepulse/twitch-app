import pkg from 'pg';
const { Pool } = pkg;

//================================//
export class DatabaseConnectionEndpoint {
    private m_pool: pkg.Pool;

    //================================//
    protected m_dbIncomingByes: number = 0.0;
    protected m_dbOutgoingBytes: number = 0.0;

    //================================//
    constructor(_user: string, _host: string, _database: string, _password: string, _port: number) {
        if ( _host === 'localhost' ) 
        {
            this.m_pool = new Pool({
                user: _user,
                host: _host,
                database: _database,
                port: _port,
                ...( _password ? { password: _password } : {} )
            });
        }
        else 
        {
            this.m_pool = new Pool({
                user: _user,
                host: _host,
                database: _database,
                password: _password,
                port: _port,
                ssl: { rejectUnauthorized: false },
            });
        }
    }

    //================================//
    protected async queryDatabase(_query: string, _params: any[] = []): Promise<any> {
        try{
            const querySize = Buffer.byteLength(_query, 'utf8');
            const paramSize = _params.reduce((acc, param) => acc + Buffer.byteLength(String(param), 'utf8'), 0);
            this.m_dbIncomingByes += querySize + paramSize;

            const result = await this.m_pool.query(_query);

            const responseSize = Buffer.byteLength(JSON.stringify(result.rows), 'utf8'); 
            this.m_dbOutgoingBytes += responseSize;

            return result;
        } catch( error ){
            console.error('Error executing a database query:', error);
            return null;
        }
    }

    //================================//
    public getUsageInformation(): string {
        const MBIncoming = (this.m_dbIncomingByes / 1024 / 1024).toFixed(3);
        const MBOutgoing = (this.m_dbOutgoingBytes / 1024 / 1024).toFixed(3);
        return `Database Incoming: ${MBIncoming} MB | Database Outgoing : ${MBOutgoing} MB`;
    }
}