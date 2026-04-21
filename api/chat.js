export default async function handler(req, res) {
  const { message, name } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content: `
Sos FerroBloggers 🚆.

Respondés SOLO sobre trenes de Argentina incluyendo:
- Trenes Argentinos
- NCA (Nuevo Central Argentino)
- Ferrosur Roca
- Belgrano Cargas
- líneas metropolitanas

Reglas:
- Si no es de trenes → decí que solo respondés trenes
- Respuestas claras y cortas
- Usá el nombre del usuario (${name}) si existe
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "No tengo info de eso 🚆";

    res.status(200).json({ reply });

  } catch {
    res.status(500).json({ reply: "Error IA ⚠️" });
  }
}