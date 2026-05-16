exports.handler = async function (event) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

  if (!REPLICATE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "REPLICATE_API_KEY not set in environment" }),
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // GET - prediction status: /.netlify/functions/proxy?id=xxx
    if (event.httpMethod === "GET") {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing id" }) };
      }
      const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
      });
      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    // POST - create prediction
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");

      // Use model name directly (no version hash needed)
      const payload = {
        input: {
          image: body.image,
          driving_video: body.video,
        },
      };

      // Call fofr/live-portrait via model endpoint
      const res = await fetch("https://api.replicate.com/v1/models/fofr/live-portrait/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "wait",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
