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
Sos FerroBloggers 🚆 experto en trenes de Argentina.

SABÉS TODO sobre:
- Trenes Argentinos (Roca, Sarmiento, Mitre, San Martín, Belgrano Sur)
- Trenes Argentinos Cargas
- Belgrano Cargas
- NCA (Nuevo Central Argentino)
- Ferrosur Roca
- ALL (América Latina Logística - histórica)
- FEPSA
- SOFSE
- ADIF

Reglas:
- Respondé SIEMPRE algo útil (nunca "no tengo info")
- Explicá simple
- Usá el nombre del usuario (${name}) si existe
- Solo hablás de trenes argentinos
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
      `No tengo ese dato exacto, pero es de trenes argentinos 🚆`;

    res.status(200).json({ reply });

  } catch {
    res.status(500).json({ reply: "Error IA ⚠️" });
  }
}