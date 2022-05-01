import mysql from 'mysql2';

export class DebugTester {
    static query(q, data = []) {
        return new Promise((res, rej) => {
            console.log(query);
            res(query);
        });
    }
}

export default class SqlSingleton {
    static setSql(sql) {
        this.sql = sql;
    }

    static query(q, data = []) {
        return new Promise((res, rej) => {
            SqlSingleton.sql.query(q, data, (err, dbData) => {
                if (err) { 
                    rej(err.message);
                    return;
                }
    
                if (data.length == 0) {
                    rej(new Error("Not found in database"))
                    return;
                }

                console.log(dbData);
    
                res(dbData);
            });
        });
    }
}