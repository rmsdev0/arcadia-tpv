exports.handler = async function(context, event, callback) {

    const from = event.From;
    let response = new Twilio.Response();

    response.setStatusCode(200)
    callback(null, response);
};