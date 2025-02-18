import pkg from 'pg';
const { Pool } = pkg;

//================================//
export class DatabaseConnectionEndpoint {
    private m_pool: pkg.Pool;

    //================================//
    constructor(_user: string, _host: string, _database: string, _password: string, _port: number) {
        console.log('Constructing a new DatabaseConnectionEndpoint with the following parameters:');
        console.log('User: ' + _user);
        console.log('Host: ' + _host);
        console.log('Database: ' + _database);
        console.log('Port: ' + _port);
        this.m_pool = new Pool({
            user: _user,
            host: _host,
            database: _database,
            password: _password,
            port: _port,
            ssl: { rejectUnauthorized: false },
        });
    }

    //================================//
    protected async queryDatabase(_query: string): Promise<any> {
        const result = await this.m_pool.query(_query);
        return result;
    }
}