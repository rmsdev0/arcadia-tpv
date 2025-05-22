/**
 *  start-flow-execution.js  (replaces old create‑call.js)
 *
 *  Purpose
 *  -------
 *  Kick off a **Twilio Studio Flow Execution** that dials the customer via the
 *  Flow’s built‑in "Make Outgoing Call" widget.  No TwiML redirect gymnastics
 *  required.
 *
 *  Request (HTTP POST)
 *  -------------------
 *    phone        – destination number (E.164)
 *    studioFlow   – Flow SID (FWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)
 *    token        – shared secret (validates caller)
 *    fromNumber   – optional caller‑ID; falls back to context.TWILIO_NUMBER
 *    …any extra fields will be forwarded to the Flow via `parameters`.
 *
 *  Response (application/json)
 *  ---------------------------
 *    { status: 'success', executionSid: 'FN…', to: '+1…', from: '+1…' }
 */

exports.handler = async function (context, event, callback) {
    /*─────────────────────────── helpers ───────────────────────────*/
    const json = (code, body) => {
        const r = new Twilio.Response();
        r.appendHeader('Content-Type', 'application/json');
        r.setStatusCode(code);
        r.setBody(body);
        return r;
    };

    /*─────────────────────────── 1. Basic validation ───────────────*/
    const { phone, studioFlow, token, fromNumber, ...rest } = event;
    if (!phone || !studioFlow || !token)
        return callback(null, json(400, {
            status: 'error', message: 'Missing required parameters: phone, studioFlow, token'
        }));

    if (token !== context.validator)
        return callback(null, json(403, { status: 'error', message: 'Invalid token.' }));

    /*─────────────────────────── 2. Kick off Flow execution ────────*/
    try {
        const client = context.getTwilioClient();
        const from = fromNumber?.trim() || context.TWILIO_NUMBER;

        // `parameters` can pass arbitrary JSON into the Flow (optional)
        const execution = await client.studio.v2
            .flows(studioFlow)
            .executions.create({ to: phone, from, parameters: rest });

        return callback(null, json(200, {
            status: 'success', executionSid: execution.sid, to: phone, from
        }));
    } catch (err) {
        console.error('start-flow-execution error:', err);
        return callback(null, json(500, { status: 'error', message: err.message }));
    }
};
