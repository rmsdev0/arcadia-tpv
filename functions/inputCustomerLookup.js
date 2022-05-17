const mysql = require("mysql");

exports.handler = async function(context, event, callback) {
    const response = new Twilio.Response();
    var searchParam = null;
    var searchValue = event.search_value;

    if (event.lookup_type === "phone"){
        searchParam = "customer_phone";
        searchValue = "+1".concat(searchValue)
        // todo remove - what is the incoming phone format going to be? Preference -> +15551234567

    }else if(event.lookup_type === "utility"){
        searchParam = "utility_account_number";
    }

    context.callbackWaitsForEmptyEventLoop = false;
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

    try {
        const db = new Database(config);

        db.connection.connect();
        const users = await db.query(`select * from prospect_records where ${searchParam}=${searchValue}`);
        await db.close();
        console.log("lookup results", users);

        if (Object.keys(users).length === 0) {
            // no customer found
            response.setStatusCode(405)
            response.setBody('no customer found2')
            callback(null, response)

        }else {
            // customer found
            let prospectRecords = JSON.parse(JSON.stringify(users[0]))
            prospectRecords.format_phone = numberString(prospectRecords.customer_phone)
            prospectRecords.format_reference = numberString(prospectRecords.utility_account_number)
            callback(null, prospectRecords);
        }

    } catch (e) {
        console.log('db lookup error ', e);
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