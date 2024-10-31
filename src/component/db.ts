import { ClickHouse } from 'clickhouse'
import uuid from 'uuid'
import config from '../config'

export class Database {
  private static clickhouse: ClickHouse;
  public static async connect (): Promise<any> {
    this.clickhouse = new ClickHouse(config.db)
    return this.clickhouse
  }

  public static async query (query: string): Promise<any> {
    this.clickhouse.sessionId = uuid()
    return await this.clickhouse.query(query).toPromise()
  }
}
