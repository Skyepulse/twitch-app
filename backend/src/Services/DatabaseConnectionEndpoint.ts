import { Pool } from "pg";

//================================//
export class DatabaseConnectionEndpoint {
    private m_pool: Pool;

    //================================//
    constructor(_user: string, _host: string, _database: string, _password: string, _port: number) {
        this.m_pool = new Pool({
            user: _user,
            host: _host,
            database: _database,
            password: _password,
            port: _port,
        });
    }

    //================================//
    protected async queryDatabase(_query: string): Promise<any> {
        const result = await this.m_pool.query(_query);
        return result;
    }
}