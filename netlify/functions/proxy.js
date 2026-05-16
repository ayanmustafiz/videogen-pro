exports.handler = async function(event) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  var API_KEY = process.env.REPLICATE_API_KEY;

  try {
    var body = JSON.parse(event.body);
    var url = body.url;
    var method = body.method || 'POST';
    var payload = body.payload;

    var fetchOpts = {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60'
      }
    };
    if (payload) fetchOpts.body = JSON.stringify(payload);

    var response = await fetch(url, fetchOpts);
    var data = await response.json();

    return {
      statusCode: response.status,
      headers: headers,
      body: JSON.stringify(data)
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
