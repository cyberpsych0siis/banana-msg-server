import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import mysql from "mysql2"

export class DatabaseConnector {
  static database = null

  setDatabase(db) {
    DatabaseConnector.database = db
  }

  query() {

  }

  isDatabaseAvailable() {
    return database !== null
  }
}

export class SQliteDatabaseConnector extends DatabaseConnector {
  constructor() {
    super();
    // this is a top-level await 
    (async () => {
    // open the database
      const db = await open({
        filename: '/app/database.db',
        driver: sqlite3.Database
      });

      this.setDatabase(db);
    })()
  }

  runQuery(q, d) {
    return DatabaseConnector.database.get(q, d)
  }
}

export default class MySQLDatabaseConnector extends DatabaseConnector {
    constructor() {
      super();
      this.setDatabase(mysql.createConnection({
        host: process.env.MYSQL_HOST ?? 'mysql',
        user: 'root',
        password: process.env.MYSQL_ROOT_PASSWORD ?? "example",
        database: "banana-msg"
      }));
    }

    runQuery(q, d, callback) {
      MySQLDatabaseConnector.database.query(q, d, callback)
    }
}