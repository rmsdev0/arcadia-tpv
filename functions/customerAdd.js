const mysql = require("mysql");

exports.handler = async function(context, event, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    const config = {
        host: context.host,
        port: context.port,
        user: context.user,
        password: context.password,
        database: context.database
    };

    console.log("connected", config);
    try {
        const db = new Database(config);
        db.connection.connect();
        const user = {
            phone_number: "+12222222222",
            first_name: "John",
            last_name: "Doe"
        };
        const users = await db.query("insert into users set ?", user);
        await db.close();
        console.log(users);
        callback(null, users);
    } catch (e) {
        callback(e);
    }
};

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}