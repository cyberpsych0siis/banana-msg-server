export default class DatabaseConnector {
    static database = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'test'
      });
}