exports.handler = async function(context, event, callback) {

    const from = event.From;
    let response = new Twilio.Response();

    let outgoingUrl = 'https://hooks.zapier.com/hooks/catch/133054/bkr6rae'
    let testUrl = ""
    const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Recordings/${event.recording_sid}`
    console.log('response eval ', event)

    ivrResponses = [event.resp_a, event.resp_b, event.resp_c, event.resp_d, event.resp_e, event.resp_f, event.resp_i]

    const positiveResponses = ['Yes', 'Yeah', 'Ya', 'Correct', 'Yup', 'Yep']
    const negativeResponses = ['No', 'Not', 'Cancel', 'I don’t want this', 'I do not understand', 'stop']


    async function evalResponses(){
        // evaluate responses and set status
        let posVal = 0
        let negVal = 0
        let nutVal = 0
        let statusVal = null

        for (let i = 0; i < ivrResponses.length; i++) {
            if(positiveResponses.includes(i)){
                posVal += 1
            }else if(negativeResponses.includes(i)){
                negVal += 1
            }else{
                nutVal += 1
            }
        }

        if (posVal === ivrResponses.length){
            statusVal = "Good Sale"
        }else if(negVal > 0){
            statusVal = "No Sale"
        }else{
            statusVal = "Needs Review"
        }

        return status_val
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
            staus: getStatus,
            recording_link: recordingUrl
        },
    };

    let custData = await axios
        .post(testUrl, config)
        .then((response) => {
            return response.data;
        })

    response.setStatusCode(200)
    callback(null, response);
};