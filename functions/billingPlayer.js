exports.handler = async function(context, event, callback) {

    const billingSegment = event.segment;
    const billingCode = event.billing_code;
    const trimmedCode = event.billing_code.replace(/\s/g, '')

    console.log('Billing Player ', event)
    console.log(event.billing_code)

    //default billing url?
    let resolvedUrl = null

    const billingUrls = {

        "UCB": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/H+UCB+Part+1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/H+UCB+Part+2.mp3"
        },
        "ACB": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+Part+1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+Part+2.mp3"
        },
        "ACBSO": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+SO+Part+1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+SO+Part+2.mp3"
        },
        "DUAL": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/DUAL+Part+1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/DUAL+Part+2.mp3"
        }
    }

    if (billingCode){

        resolvedUrl = billingUrls[trimmedCode][billingSegment]
        console.log('returned url ', resolvedUrl)

    }

    const response = new Twilio.twiml.VoiceResponse();

    response.play({
        loop: 1
    }, resolvedUrl);

    response.redirect({
        method: 'POST'
    }, 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FW23c12afaf7cce3a7f198e3d93f5c5204?FlowEvent=return');

    callback(null, response);

};