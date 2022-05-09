
// import mysql from "mysql2"

// import fs from 'fs';
// const queries = JSON.parse(fs.readFileSync('./queries.json', 'utf-8'))
import queries from './queries.js';

/**
 * @deprecated
 */
export class DatabaseConnector {
  constructor() {

  }

  static query(query, args = []) {
    return new Promise((resolve, reject) => {
      // console.log(this);
      /*       DatabaseConnector.db.run(queries[query], args).then((err, result) => {
              if (err) {
                console.error(err);
                reject(err);
              }
      
              console.log(result);
      
              resolve(result);
            })
          }); */

/*           DatabaseConnector.db.transaction(function(tx) {
            tx.executeSql((queries[query], args, (tx, r) => {
              console.log(tx, r.insertId);
            }));
          }); */

      const stmt = DatabaseConnector.db.prepare(queries[query], args, (err) => {
        if (err) {
          console.log(stmt, err);
          reject(err);
        } else {
          stmt.run((data) => {
            // console.log("Statement ran");
            // console.log(DatabaseConnector.db.lastInsertRowId);
            console.log(data, stmt);
            resolve(data)
          });
        }
      }); 
      // console.log(stmt);
      // stmt.run();

      // return stmt;
    });
  }

  static runQ(q, args = []) {
    
  }

  /*   isDatabaseAvailable() {
      return database !== null
    } */
}

let db;

// (async () => {

/* db = open({
  filename: "./db/default.db",
  driver: sqlite3.Database
}); */
// })

export async function runQuery(queryname, params) {
  let erg = await db.query(queries[queryname], params);
  console.log(erg);
  return erg;
}