export default function(message) {
    var data = {
        app_id: "073be8f0-feda-43ea-965a-07a63e485527",
        contents: {"en": message},
        included_segments: ["All"]
    }

    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Basic ZDY1YWFiYTUtNTI0ZC00MzIwLTljYzctOTZiNTNjYTgxNTk4"
    }

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    }

    var https = require('https');
    var req = https.request(options, function(res) {
        res.on('data', function(data) {
            console.log("Response:")
            console.log(JSON.parse(data))
        })
    })

    req.on('error', function(e) {
        console.log("ERROR:")
        console.log(e)
    })

    req.write(JSON.stringify(data))
    req.end()
}
