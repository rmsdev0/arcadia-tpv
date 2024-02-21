const mysql = require("mysql");
exports.handler = async function(context, event, callback) {
    const axios = require("axios");
    let response = new Twilio.Response();

    let outgoingUrl = 'https://hooks.zapier.com/hooks/catch/133054/bkr6rae'
    const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Recordings/${event.recording_sid}`

    // All responses captured by the IVR
    const ivrResponses = [event.resp_a, event.resp_b, event.resp_c, event.resp_d, event.resp_e, event.resp_f, event.resp_i]

    // IVR responses to be evaluated,
    const requiredResponses = [event.resp_e, event.resp_f, event.resp_i]

    // get positive and negative response lists from the db
    function extractResponses(dbList){
        let respList = []
        dbList.forEach(element => {
            respList.push(element.name)
        });
        return respList
    }

    const dbConfig = {
        host: context.host,
        port: context.port,
        user: context.user,
        password: context.password,
        database: context.database
    };

    const db = new Database(dbConfig);
    db.connection.connect();
    const getPositiveResponses = await db.query(`select * from responses where affirmative=1`);
    const getNegativeResponses = await db.query(`select * from responses where affirmative=0`);
    const positiveResponses = extractResponses(getPositiveResponses);
    const negativeResponses = extractResponses(getNegativeResponses);
    await db.close();

    function trimResponse (customerResp){
        const removeComma = customerResp.replace(",", '')
        const removePeriod = removeComma.replace(".", '')
        const trimString = removePeriod.replace(/\s/g, '')
        return trimString.toLowerCase()
    }

    // generate date
    let date = new Date()
    let day = date.getDate();
    let month = date.getMonth()+1;
    let year = date.getFullYear();
    let fullDate = `${month}-${day}-${year}`;

    // evaluate responses and set status
    async function evalResponses(){

        let posVal = 0
        let negVal = 0
        let nutVal = 0
        let statusVal = null

        // eval required responses
        requiredResponses.forEach(resp => {
            if(positiveResponses.includes(trimResponse(resp))){
                posVal += 1
            }else if(negativeResponses.includes(trimResponse(resp))){
                negVal += 1
            }else{
                nutVal += 1
            }
        });

        // eval required responses
        ivrResponses.forEach(resp => {
            if(negativeResponses.includes(trimResponse(resp))){
                negVal += 1
            }
        });

        if (posVal === requiredResponses.length){
            statusVal = "Good Sale"
        }else if(negVal > 0){
            statusVal = "No Sale"
        }else{
            statusVal = "In Review"
        }
        return statusVal
    }

    const getStatus = await evalResponses()

    // post data back to zapier endpoint
    let config = {
        params: {
            customer_phone: event.customer_phone,
            customer_ani: event.customer_ani,
            first_name: event.first_name,
            last_name: event.last_name,
            rep_phone: event.rep_phone,
            billing_type: event.billing_type,
            status: getStatus,
            recording_link: recordingUrl,
            recording_sid: event.recording_sid,
            call_sid: event.call_sid,
            reference_number: event.reference_number,
            date: fullDate,
            ivr_responses: ivrResponses,
            call_duration: event.call_duration
        },
    };
    let custData = await axios
        .post(outgoingUrl, config)
        .then((response) => {
            return response.data;
        })

    // do we need to check if the post was successful?
    console.log('cust data', custData)

    response.setStatusCode(200)
    callback(null, response);
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
