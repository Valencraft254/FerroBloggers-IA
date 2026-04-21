export default async function handler(req, res) {
  const { message, name } = req.body;

  const text = message.toLowerCase();

  // respuestas básicas
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
    // 🔎 BUSCAR EN INTERNET (DuckDuckGo)
    const searchRes = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(message + " trenes Argentina")}&format=json`
    );

    const searchData = await searchRes.json();

    const snippet =
      searchData.Abstract ||
      searchData.RelatedTopics?.[0]?.Text ||
      "";

    // 🤖 IA resume mejor
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos FerroBloggers 🚆.

Usá esta info real encontrada en internet:
${snippet}

Pregunta: ${message}

Reglas:
- Respondé claro
- Si no hay info suficiente, explicá igual con conocimiento general
- Usá el nombre ${name || ""}
`
      })
    });

    const aiData = await aiRes.json();

    let reply = aiData.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      reply = `${name || ""}, es información sobre trenes argentinos 🚆`;
    }

    res.json({ reply });

  } catch (error) {
    res.json({
      reply: `${name || ""}, hubo un error buscando info en internet 🚆`
    });
  }
}