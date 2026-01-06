import axios from "axios";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: "Missing env variables" });
    }

    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("caption", "🚨 AGROW INTRUSION ALERT");
      form.append("photo", buffer, { filename: "alert.png" });

      await axios.post(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        form,
        { headers: form.getHeaders() }
      );

      res.status(200).json({ success: true });
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Telegram failed" });
  }
}
