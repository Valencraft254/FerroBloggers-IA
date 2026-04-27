export default async function handler(req, res) {

  try {
    let { message } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    const text = message.toLowerCase();

    // 🧠 RESPUESTA BASE (SIEMPRE FUNCIONA)
    let base = "";

    if (text.includes("nca")) {
      base = "Nuevo Central Argentino es una empresa de trenes de carga que opera en la red Mitre y conecta el interior del país con puertos como Rosario.";
    }

    if (text.includes("ferrosur")) {
      base = "Ferrosur Roca es una empresa de carga que utiliza las vías del Ferrocarril Roca y transporta materiales como piedra y cemento.";
    }

    // 🔎 BUSCAR EN TU API
    let info = "";

    try {
      const search = await fetch(
        `https://infotrain-dtgv.vercel.app/api/search?q=${encodeURIComponent(message)}`,
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

      console.log("RESULTADOS:", info);

    } catch (e) {
      console.log("error search", e);
    }

    // 🤖 IA SOLO SI HAY INFO
    let respuesta = base;

    if (info) {
      const ai = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          input: `
Usá esta info para responder:
${info}

Pregunta:
${message}

Respondé natural.
`
        })
      });

      const data = await ai.json();

      respuesta =
        data?.output?.[0]?.content?.[0]?.text || base;
    }

    // ❌ si no hay nada
    if (!respuesta) {
      respuesta = "No entendí, ¿me explicás de nuevo?";
    }

    res.json({
      reply: respuesta + "\n\n¿Cualquier duda decime? 🚆"
    });

  } catch (e) {
    console.error(e);
    res.json({ reply: "Error ⚠️" });
  }
}