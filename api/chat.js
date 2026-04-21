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

    if (text.includes("chau") || text.includes("adios")) {
      return res.json({ reply: `Chau ${name || ""} 👋` });
    }

    // 🔎 BUSCAR EN WIKIPEDIA
    let wikiText = "";

    try {
      const wikiRes = await fetch(
        `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(message + " tren Argentina")}`
      );

      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        wikiText = wikiData.extract || "";
      }
    } catch {}

    // 🤖 IA (con info real)
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos FerroBloggers 🚆 experto en trenes argentinos.

Información real encontrada:
${wikiText}

Pregunta: ${message}

Reglas IMPORTANTES:
- Respondé SIEMPRE algo útil
- Nunca digas "no sé"
- Explicá claro
- Usá el nombre ${name || ""}
- Solo hablá de trenes argentinos
- Si falta info, completá con conocimiento general

Ejemplo:
"Ferrosur Roca es una empresa de carga..."
`
      })
    });

    const data = await aiRes.json();

    let reply = data.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      reply = `${name || ""}, eso está relacionado con trenes argentinos 🚆`;
    }

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error del servidor ⚠️" });
  }
}