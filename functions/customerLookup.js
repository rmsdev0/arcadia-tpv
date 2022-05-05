exports.handler = async function(context, event, callback) {

    let response = new Twilio.Response();
    const from = event.From;
    const client = context.getTwilioClient();

    // Call Twilio Lookup to get information about the number, including its national format
    // Will this format the phone enough to read out? not sure that we need this here.
    const normalizedPhone = await client.lookups.phoneNumbers(from).fetch();



    response.setStatusCode(200)
    callback(null, response);
};