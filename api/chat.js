export default async function handler(req, res) {

  try {
    let { message } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    const text = message.toLowerCase();

    // 🧠 NORMALIZAR (mejora detección)
    const clean = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, "");

    // 🚆 RESPUESTAS BASE (SIEMPRE FUNCIONAN)
    let base = "";

    if (clean.includes("nca")) {
      base = "Nuevo Central Argentino es una empresa de trenes de carga que opera en la red Mitre y conecta el interior del país con puertos como Rosario.";
    }

    else if (clean.includes("ferrosur")) {
      base = "Ferrosur Roca es una empresa de carga que utiliza las vías del Ferrocarril Roca y transporta materiales como piedra y cemento.";
    }

    else if (clean.includes("mitre")) {
      base = "La línea Mitre conecta Retiro con Tigre, Suárez y Bartolomé Mitre. Es una de las principales líneas del AMBA y también es utilizada por trenes de carga.";
    }

    else if (clean.includes("roca")) {
      base = "La línea Roca conecta Constitución con La Plata, Ezeiza y Bosques y comparte vías con trenes de carga.";
    }

    else if (clean.includes("sarmiento")) {
      base = "La línea Sarmiento conecta Once con Moreno y es una de las más utilizadas para pasajeros.";
    }

    else if (clean.includes("san martin")) {
      base = "La línea San Martín conecta Retiro con Pilar y también es usada por trenes de carga.";
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

    } catch (e) {
      console.log("error search", e);
    }

    // 🤖 RESPUESTA FINAL
    let respuesta = base;

    // si hay info → usar IA
    if (info) {
      try {
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

Usá esta info:
${info}

Pregunta:
${message}

Respondé claro y natural (no copies literal).
`
          })
        });

        const data = await ai.json();

        respuesta =
          data?.output?.[0]?.content?.[0]?.text || base;

      } catch (e) {
        console.log("error IA", e);
      }
    }

    // ❌ fallback solo si no hay nada
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