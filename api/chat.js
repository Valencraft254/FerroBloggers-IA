export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  try {
    const { message, name } = req.body;
    const text = message.toLowerCase();

    // 💬 conversación normal
    if (text.includes("hola")) {
      return res.json({ reply: `Hola ${name || ""} 👋` });
    }

    if (text.includes("gracias")) {
      return res.json({ reply: `${name || ""} de nada 🚆` });
    }

    if (text.includes("chau")) {
      return res.json({ reply: `Chau ${name || ""} 👋` });
    }

    // 🤖 IA FUERTE (sin wikipedia)
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: `
Sos FerroBloggers 🚆, experto en trenes de Argentina.

Sabés sobre:
- Trenes Argentinos
- NCA
- Ferrosur Roca
- Belgrano Cargas
- Metrovías
- líneas Roca, Mitre, Sarmiento, San Martín

Reglas IMPORTANTES:
- Respondé SIEMPRE algo útil
- Nunca digas "no sé"
- Explicá claro
- Usá el nombre ${name || ""}
- Respondé como ChatGPT (natural, no robótico)

Pregunta: ${message}
`
      })
    });

    const data = await response.json();

    let reply = data.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      reply = `${name || ""}, es sobre trenes argentinos 🚆`;
    }

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error del servidor ⚠️" });
  }
}