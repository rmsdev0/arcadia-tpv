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

        let response = new Twilio.Response();
        console.log(" debug connecting ", config);

        try {
            if (event.token === context.validator) {
            const db = new Database(config);
            db.connection.connect();
            const prospect_record = {
                customer_phone: event.customerPhone,
                customer_first_name: event.customerFirstName,
                customer_last_name: event.customerLastName,
                customer_email: event.customerEmail,
                utility_account_number: event.utilityAccountNumber,
                utility_name: event.utilityName,
                reference_number: event.referenceNumber,
                rep_id: event.repId,
                rep_phone: event.repPhone,
                savings_value: event.savingsValue,
                billing_type: event.billingType
            };
            const users = await db.query("insert into prospect_records set ?", prospect_record);
            await db.close();

            response.setStatusCode(200);
            response.setBody('success')

            callback(null, response);
            }else{
                response.setStatusCode(403);
                response.setBody("invalid token ")
                callback(null, response);
            }

        } catch (e) {
            response.setStatusCode(501);
            response.setBody("error adding record")
            callback(e, response);
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