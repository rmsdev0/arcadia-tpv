/**
 *  create-call.js
 *
 *  This function:
 *   - Accepts phone, studioFlow, token, and optionally fromNumber via event parameters
 *   - Validates token against context.validator
 *   - If valid, initiates an outbound call to `phone`
 *   - Uses `fromNumber` if provided, otherwise falls back to `context.TWILIO_NUMBER`
 *   - Says a greeting, then redirects to the given Studio Flow
 *   - Returns a success or error response as JSON
 */

exports.handler = async function (context, event, callback) {
    // Create a new Twilio Response
    const response = new Twilio.Response();

    // Ensure we return JSON in all cases
    response.appendHeader('Content-Type', 'application/json');

    try {
        // Validate the token
        const { phone, studioFlow, token, fromNumber } = event;

        if (!phone || !studioFlow || !token) {
            response.setStatusCode(400);
            response.setBody({
                status: 'error',
                message: 'Missing required parameters: phone, studioFlow, token'
            });
            return callback(null, response);
        }

        if (token !== context.validator) {
            // Unauthorized
            response.setStatusCode(403);
            response.setBody({
                status: 'error',
                message: 'Invalid token provided.'
            });
            return callback(null, response);
        }

        // Token is valid; prepare to create an outbound call
        const client = context.getTwilioClient();

        // Determine which number to use as 'from'
        const effectiveFromNumber = fromNumber && fromNumber.trim() !== ''
            ? fromNumber
            : context.TWILIO_NUMBER; // todo this needs to be added in Twilio

        /**
         *  We will use inline TwiML to:
         *    - <Say> a greeting
         *    - <Redirect> to the Studio Flow
         *
         *  The Studio Flow can be addressed by the URL pattern:
         *    https://webhooks.twilio.com/v1/Accounts/{AccountSid}/Flows/{FlowSid}
         *
         *  We added "&fromEndpoint=true" so that the Studio Flow can know
         *  this call is coming from your custom endpoint if desired.
         */
        const twiml = `
      <Response>
        <Say>This is an automated call from Arcadia Energy. Please hold while we connect you.</Say>
        <Redirect>https://webhooks.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Flows/${studioFlow}?FlowEvent=trigger&fromEndpoint=true;</Redirect>
      </Response>
    `;

        // Create the call
        const call = await client.calls.create({
            to: phone,
            from: effectiveFromNumber,
            twiml: twiml
        });

        // 3. Send success response
        response.setStatusCode(200);
        response.setBody({
            status: 'success',
            callSid: call.sid,
            fromNumber: effectiveFromNumber,
            message: 'Outbound call initiated successfully.'
        });
        return callback(null, response);

    } catch (error) {
        // 4. Catch any errors and return a 500
        console.error(error);
        response.setStatusCode(500);
        response.setBody({
            status: 'error',
            message: error.message
        });
        return callback(null, response);
    }
};