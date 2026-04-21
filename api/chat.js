export default async function handler(req, res) {

  try {
    const { message, name } = req.body;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos Ferrobloggers 🚆 experto en trenes de Argentina.

Reglas:
- Solo hablar de trenes argentinos
- Si preguntan otra cosa, redirigir a trenes
- Responder claro y útil
- Usar el nombre ${name || ""}

Pregunta: ${message}
`
      })
    });

    const data = await response.json();
    const reply = data.output?.[0]?.content?.[0]?.text || "No encontré info 🚆";

    res.json({ reply });

  } catch {
    res.json({ reply: "Error ⚠️" });
  }
}