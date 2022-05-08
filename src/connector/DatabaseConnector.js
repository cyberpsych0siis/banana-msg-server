import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import mysql from "mysql2"

export class DatabaseConnector {
  setDatabase(db) {
    DatabaseConnector.db = open({
      filename: "/app/db/default.db",
      driver: sqlite3.Database
    })
  }

  query(query, args = []) {
    return new Promise((resolve, reject) => {
      DatabaseConnector.db.query(query, args).then((err, result) => {
        if (err) rej(err);

        console.log(result);

        resolve(result);
      })
    });
  }

  isDatabaseAvailable() {
    return database !== null
  }
}

/**
 * @deprecated
 */
export class SQliteDatabaseConnector extends DatabaseConnector {
  constructor() {
    super();
    // this is a top-level await 
    (async () => {
    // open the database
      const db = await open({
        // filename: '/app/database.db',
        filename: ":memory:",
        driver: sqlite3.Database
      });

      this.setDatabase(db);
    })()
  }

  runQuery(q, d) {
    return DatabaseConnector.database.get(q, d)
  }
}

/**
 * @deprecated
 */
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