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

    static loadSql() {
        try {
            SqlSingleton.sql = mysql.createConnection({
                host: process.env.MYSQL_HOST ?? "localhost",
                user: process.env.MYSQL_USER ?? "root",
                password: process.env.MYSQL_PASS ?? "",
                database: process.env.MYSQL_DATABASE ?? "banana-msg"
            });
        } catch (e) {
            console.log(e);

            console.error("Running in Debug Mode")
            SqlSingleton.sql = new DebugTester()
        }
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

                console.log(data);
    
                res(data);
            });
        });
    }
}