exports.handler = async function (event, context) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

  if (!REPLICATE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "REPLICATE_API_KEY not set" }),
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { action, predictionId } = body;

    // GET prediction status
    if (event.httpMethod === "GET" || action === "get") {
      const id = predictionId || event.queryStringParameters?.id;
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return { statusCode: response.status, headers, body: JSON.stringify(data) };
    }

    // POST - create prediction
    if (event.httpMethod === "POST") {
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { statusCode: response.status, headers, body: JSON.stringify(data) };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
