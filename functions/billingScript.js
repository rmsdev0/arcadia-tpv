exports.handler = async function(context, event, callback) {

    let response = new Twilio.Response();
    const trimmedCode = event.billing_code.replace(/\s/g, '')

    if (event.billing_code) {
        const billingUrls = {

            "UCB": {
                "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/H+UCB+Part+1.mp3",
                "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/2024+IL+ONLY+UCB+Part+2.mp3"
            },
            "ACB": {
                "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+Part+1.mp3",
                "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+Part+2.mp3"
            },
            "ACB SO": {
                "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+SO+Part+1.mp3",
                "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/H+ACB+SO+Part+2.mp3"
            },
            "Dual": {
                "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/DUAL+Part+1.mp3",
                "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/DUAL+Part+2.mp3"
            }
        }

        response.setStatusCode(200)
        response.setBody(JSON.stringify(billingUrls[trimmedCode]))
        callback(null, response);
    }
    // todo remove old ucb part 2 url "https://autotpvscriptrecordings.s3.amazonaws.com/H+UCB+Part+2.mp3"
    // no billing code, do we also need to check if the billing code is valid and return a generic billing script here if not found.
};
