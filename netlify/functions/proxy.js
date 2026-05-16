exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: ''
    };
  }

  var API_KEY = 'r8_YdF1hOG5OkE5bjGwTlmbc8urDTGAv3G2vatJB';
  var body = JSON.parse(event.body);
  var url = body.url;
  var payload = body.payload;

  var https = require('https');
  var urlObj = new URL(url);

  var options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    method: payload ? 'POST' : 'GET',
    headers: {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'wait=60'
    }
  };

  return new Promise(function(resolve) {
    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        resolve({
          statusCode: res.statusCode,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: data
        });
      });
    });
    req.on('error', function(e) {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
    });
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
};
