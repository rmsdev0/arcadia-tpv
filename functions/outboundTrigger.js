/**
 *  create-call.js (helper‑library version)
 *
 *  This Twilio Function:
 *    • Accepts `phone`, `studioFlow`, `token`, and optional `fromNumber` in the POST body
 *    • Validates `token` against `context.validator`
 *    • Initiates an outbound call to `phone`
 *        – Greets the callee with <Say>
 *        – Redirects the live call into the specified Studio Flow
 *    • Responds with JSON indicating success or failure
 */

exports.handler = async function (context, event, callback) {
    // ---- prepare JSON response helper ----
    const jsonResponse = (statusCode, payload) => {
        const resp = new Twilio.Response();
        resp.appendHeader('Content-Type', 'application/json');
        resp.setStatusCode(statusCode);
        resp.setBody(payload);
        return resp;
    };

    try {
        // Extract & basic validation
        const { phone, studioFlow, token, fromNumber } = event;
        if (!phone || !studioFlow || !token) {
            return callback(
                null,
                jsonResponse(400, {
                    status: 'error',
                    message: 'Missing required parameters: phone, studioFlow, token',
                })
            );
        }

        if (token !== context.validator) {
            return callback(
                null,
                jsonResponse(403, { status: 'error', message: 'Invalid token provided.' })
            );
        }

        // Build outbound call parameters
        const client = context.getTwilioClient();
        const effectiveFrom = fromNumber && fromNumber.trim() !== '' ? fromNumber : context.TWILIO_NUMBER;

        // Generate TwiML with helper library (auto‑escapes &, <, >)
        const VoiceResponse = Twilio.twiml.VoiceResponse;
        const twiml = new VoiceResponse();

        twiml.say(
            'This is an automated call from Arcadia Energy. Please hold while we connect you.'
        );

        const flowUrl =
            `https://webhooks.twilio.com/v1/Accounts/${context.ACCOUNT_SID}` +
            `/Flows/${studioFlow}?FlowEvent=trigger`;

        twiml.redirect({ method: 'POST' }, flowUrl);

        // Create the call
        const call = await client.calls.create({
            to: phone,
            from: effectiveFrom,
            twiml: twiml.toString(),
        });

        // Return success JSON
        return callback(
            null,
            jsonResponse(200, {
                status: 'success',
                callSid: call.sid,
                fromNumber: effectiveFrom,
                message: 'Outbound call initiated successfully.'
            })
        );
    } catch (err) {
        console.error('create‑call.js error:', err);
        return callback(
            null,
            jsonResponse(500, { status: 'error', message: err.message })
        );
    }
};
