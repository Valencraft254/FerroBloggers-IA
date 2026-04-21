export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Escribí algo 👀" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: message
      })
    });

    const data = await response.json();

    const reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "No pude responder 😅";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.json({ reply: "Error ⚠️" });
  }
}