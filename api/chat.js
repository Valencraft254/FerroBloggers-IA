export default async function handler(req, res) {

  try {
    let { message, name } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    // 🔎 1. BUSCAR EN TU API
    let info = "";

    try {
      const search = await fetch(
        `https://TUWEB.vercel.app/api/search?q=${encodeURIComponent(message)}`,
        {
          headers: {
            "x-api-key": "FERRO_KEY_92837"
          }
        }
      );

      const data = await search.json();

      if (data?.results?.length > 0) {
        info = data.results.join("\n");
      }

    } catch (e) {
      console.log("error search", e);
    }

    // 🤖 2. IA RESPONDE
    const ai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos Ferrobloggers 🚆 experto en trenes argentinos.

Usá esta información:
${info}

Pregunta del usuario:
${message}

Respondé como una explicación natural (no copies literal).
Si no hay info suficiente:
"No entendí, ¿me explicás de nuevo?"
`
      })
    });

    const data = await ai.json();

    let reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "No entendí, ¿me explicás de nuevo?";

    // 💬 respuesta final
    res.json({
      reply: `${reply}\n\n¿Cualquier duda decime? 🚆`
    });

  } catch (e) {
    console.error(e);
    res.json({ reply: "Error ⚠️" });
  }
}