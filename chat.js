export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `Sos FerroBloggers. Respondé corto:\n${message}`
      })
    });

    const data = await response.json();
    const reply = data.output?.[0]?.content?.[0]?.text || "Sin respuesta";

    res.status(200).json({ reply });

  } catch {
    res.status(500).json({ reply: "Error IA" });
  }
}