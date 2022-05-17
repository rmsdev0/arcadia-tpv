exports.handler = async function(context, event, callback) {

    const from = event.From;
    let response = new Twilio.Response();

    let outgoingUrl = 'https://hooks.zapier.com/hooks/catch/133054/bkr6rae/'
    console.log('response eval ', event)

    response.setStatusCode(200)
    callback(null, response);
};