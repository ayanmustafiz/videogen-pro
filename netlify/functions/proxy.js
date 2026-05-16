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
    // GET - prediction status check: /.netlify/functions/proxy?id=xxx
    if (event.httpMethod === "GET") {
      const id = event.queryStringParameters && event.queryStringParameters.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing prediction id" }) };
      }
      const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
      });
      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    // POST - create prediction or check status
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");

      // Status check via POST
      if (body.predictionId) {
        const res = await fetch(`https://api.replicate.com/v1/predictions/${body.predictionId}`, {
          headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
        });
        const data = await res.json();
        return { statusCode: res.status, headers, body: JSON.stringify(data) };
      }

      // Create new prediction - fofr/live-portrait
      const payload = {
        version: "1972a5504fc634eac4a28b2ccde6b7f59bf4ef99b3c64e09ab9e7f4ba37fba62",
        input: {
          image: body.image,
          video: body.video,
          motion_template: body.motion_template || "head_rotation",
        },
      };

      const res = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
