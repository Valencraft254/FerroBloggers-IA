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
        input: `
Sos FerroBloggers 🚆, un bot especializado en trenes argentinos.

Reglas:
- Respondé SOLO sobre trenes de Argentina
- Si preguntan otra cosa → decí: "Solo respondo sobre trenes argentinos 🚆"
- Respuestas claras y cortas
- Podés incluir líneas, estaciones, horarios, ramales

Pregunta:
${message}
`
      })
    });

    const data = await response.json();

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "No pude responder eso 🚆";

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({
      reply: "Error con la IA ⚠️"
    });
  }
}