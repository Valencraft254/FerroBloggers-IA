export default async function handler(req, res) {

  try {
    let { message } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    // 🔎 buscar info (sin mostrar)
    let info = "";

    try {
      const search = await fetch(
        `https://serpapi.com/search.json?q=${encodeURIComponent(message + " trenes Argentina")}&num=5&api_key=${process.env.SERP_API_KEY}`
      );

      const data = await search.json();

      if (data?.organic_results) {
        info = data.organic_results
          .map(r => r.snippet)
          .join("\n");
      }

    } catch (e) {
      console.log("error búsqueda", e);
    }

    // 🤖 IA
    const ai = await fetch("https://api.openai.com/v1/responses", {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos Ferrobloggers experto en trenes argentinos.

Usá esta información para responder, pero NO menciones fuentes:
${info}

Pregunta:
${message}

Respondé claro y natural.

Si no entendés:
"No entendí, ¿me explicás de nuevo?"
`
      })
    });

    const data = await ai.json();

    let reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "No entendí, ¿me explicás de nuevo?";

    res.json({ reply });

  } catch (e) {
    console.error(e);
    res.json({ reply: "Error ⚠️" });
  }
}