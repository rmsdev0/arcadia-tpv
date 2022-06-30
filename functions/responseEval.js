exports.handler = async function(context, event, callback) {
    const axios = require("axios");

    console.log('response eval ', event)
    let response = new Twilio.Response();

    let outgoingUrl = 'https://hooks.zapier.com/hooks/catch/133054/bkr6rae'
    // todo remove testUrl
    let testUrl = "https://377d-2601-446-680-b8a0-14d5-95e2-cd2e-2e48.ngrok.io"
    const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Recordings/${event.recording_sid}`

    const ivrResponses = [event.resp_a, event.resp_b, event.resp_c, event.resp_d, event.resp_e, event.resp_f, event.resp_i]
    const positiveResponses = ['yes', 'yeah', 'ya', 'correct', 'yup', 'yep']
    const negativeResponses = ['no', 'not', 'cancel', 'i don’t want this', 'i do not understand', 'stop']

    function trimResponse (customerResp){
        console.log('resp 1 ', customerResp)
        const removePeriod = customerResp.replace(".", '')
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

        ivrResponses.forEach(resp => {
            console.log('resp ', resp)
            if(positiveResponses.includes(trimResponse(resp))){
                posVal += 1
            }else if(negativeResponses.includes(trimResponse(resp))){
                negVal += 1
            }else{
                nutVal += 1
            }
        });

        if (posVal === ivrResponses.length){
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
            ivr_responses: ivrResponses
        },
    };
    console.log('params ', config)
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