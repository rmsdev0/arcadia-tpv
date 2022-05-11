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
    console.log('event ', event)
    try {
        const db = new Database(config);

        db.connection.connect();
        const users = await db.query(`select * from prospect_records where customer_phone=${event.from}`);
        await db.close();
        console.log("lookup results", users);
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