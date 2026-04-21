export default async function handler(req, res) {
  const { message, name } = req.body;
  const text = message.toLowerCase();

  // respuestas normales
  if (text.includes("hola")) {
    return res.json({ reply: `Hola ${name || ""} 👋` });
  }
  if (text.includes("gracias")) {
    return res.json({ reply: `De nada ${name || ""} 🚆` });
  }
  if (text.includes("chau")) {
    return res.json({ reply: `Chau ${name || ""} 👋` });
  }

  try {
    // 🔎 BUSCAR EN WIKIPEDIA
    const wikiRes = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(message + " tren Argentina")}`
    );

    let wikiText = "";

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      wikiText = wikiData.extract || "";
    }

    // 🤖 IA USA ESA INFO
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

Información encontrada:
${wikiText}

Pregunta: ${message}

Reglas:
- Respondé claro
- Usá el nombre ${name || ""}
- Si hay info de Wikipedia, usala
- Si no, explicá igual con conocimiento general
`
      })
    });

    const aiData = await aiRes.json();
    let reply = aiData.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      reply = `${name || ""}, eso es sobre trenes argentinos 🚆`;
    }

    res.json({ reply });

  } catch (error) {
    res.json({
      reply: `${name || ""}, error buscando info 🚆`
    });
  }
}