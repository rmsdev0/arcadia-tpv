exports.handler = async function(context, event, callback) {

    let billingCode = event.billing_code;
    const billingSegment = event.segment;
    const language = event.language;
    const scriptType = event.script_type;

    //default billing url?
    let resolvedUrl = null

    const flowUrls = {
        'en': 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FW23c12afaf7cce3a7f198e3d93f5c5204?FlowEvent=return',
        'es': 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FWfd89f076696ea58590c85462d2bce9af?FlowEvent=return',
        'cw': 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FW3d5aa76ab902f6b6204bd6231d604b30?FlowEvent=return',
        'ab': 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FW93af44db204fa69f0e842c8daa478666?FlowEvent=return',
        'nl': 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FW29fd7cca5c78c8a27f122bc0c73e0d9c?FlowEvent=return',
        'nv': 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FWb918841d5b0d426124e2818f9e37494f?FlowEvent=return',
        'pr': 'https://webhooks.twilio.com/v1/Accounts/AC7826b283140e86185b8b15f9e71da0ce/Flows/FW3e9ac43de4f71ce2f23db168195696b9?FlowEvent=return'
    }

    let studioFlow = flowUrls['en']

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
        },
        "UCBes": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_UCB_Part_1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_UCB_Part_2.mp3"
        },
        "ACBes": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_ACB_Part_1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_ACB_Part_2.mp3"
        },
        "ACBSOes": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_ACB_SO_Part_1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_ACB_SO_Part_2.mp3"
        },
        "DUALes": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_DUAL_Part_1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/Spanish/STPV_DUAL_Part_2.mp3"
        },
        "UCBSO": {
            "p1": "https://autotpvscriptrecordings.s3.amazonaws.com/H+UCB+SO+Part+1.mp3",
            "p2": "https://autotpvscriptrecordings.s3.amazonaws.com/2024+IL+ONLY+UCB+Part+2.mp3"
        },
        "CWDUAL": {
            "p1": "https://clearwaytpv.s3.amazonaws.com/Clearway+TPV+DUAL+Part+1.mp3",
            "p2": "https://clearwaytpv.s3.amazonaws.com/Clearway+TPV+DUAL+Part+2.mp3"
        },
        "PerchDUAL": {
            "p1": "https://perchtpv.s3.us-east-1.amazonaws.com/PerchDUALPart1.mp3",
            "p2": "https://perchtpv.s3.us-east-1.amazonaws.com/PerchDUALPart2.mp3"
        },
        "PerchHUCB": {
            "p1": "https://perchtpv.s3.us-east-1.amazonaws.com/PerchHUCBPart1.mp3",
            "p2": "https://perchtpv.s3.us-east-1.amazonaws.com/PerchHUCBPart2.mp3"
        },
    }

    if (billingCode){
        if (language){
            billingCode = billingCode.concat(language);
            studioFlow = flowUrls[language];
        }
        if (scriptType){
            studioFlow = flowUrls[scriptType]
        }
        const trimmedCode = billingCode.replace(/\s/g, '');
        resolvedUrl = billingUrls[trimmedCode][billingSegment];
    }

    const response = new Twilio.twiml.VoiceResponse();

    response.play({
        loop: 1
    }, resolvedUrl);

    response.redirect({
        method: 'POST'
    }, studioFlow);

    callback(null, response);
};