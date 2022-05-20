const mysql = require("mysql");

exports.handler = async function(context, event, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    const response = new Twilio.Response()
    const config = {
        host: context.host,
        port: context.port,
        user: context.user,
        password: context.password,
        database: context.database
    };

    function numberString(inNum){
        fString = inNum.split('').join(' ')
        return fString
    }

    console.log("connected", config);
    console.log('event ', event);

    try {
        const db = new Database(config);

        db.connection.connect();
        const users = await db.query(`select * from prospect_records where customer_phone=${event.from}`);
        await db.close();

        if (Object.keys(users).length === 0){
            // no customer found
            console.log('no customer found')
            response.setStatusCode(405)
            response.setBody('no customer found')
            callback(null, response)
        }
        // customer found
        console.log('customer found')
        let prospectRecords = JSON.parse(JSON.stringify(users[users.length - 1]))
        prospectRecords.format_phone = numberString(prospectRecords.customer_phone)
        prospectRecords.format_reference = numberString(prospectRecords.utility_account_number)
        callback(null, prospectRecords);
    } catch (e) {
        console.log('db lookup error ', e)
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