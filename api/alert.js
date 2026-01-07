import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Missing env variables" });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("photo", buffer, {
      filename: "alert.png",
      contentType: "image/png"
    });

    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: form
      }
    );

    const data = await tgRes.json();

    if (!data.ok) {
      return res.status(500).json(data);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Telegram backend error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
