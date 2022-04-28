export default class DatabaseConnector {
    static database = mysql.createConnection({
      host: process.env.MYSQL_HOST ?? 'mysql',
      user: 'root',
      password: process.env.MYSQL_ROOT_PASSWORD ?? "example",
      database: "banana-msg"
    });
}