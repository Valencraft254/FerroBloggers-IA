export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  try {
    const { message, name } = req.body;
    const text = message.toLowerCase();

    // 💬 respuestas básicas
    if (text.includes("hola")) {
      return res.json({ reply: `Hola ${name || ""} 👋` });
    }
    if (text.includes("gracias")) {
      return res.json({ reply: `De nada ${name || ""} 👍` });
    }
    if (text.includes("chau")) {
      return res.json({ reply: `Chau ${name || ""} 👋` });
    }

    // 🔎 intento de búsqueda simple (Wikipedia mejorada)
    let info = "";
    try {
      const search = await fetch(
        `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(message)}&format=json&origin=*`
      );
      const searchData = await search.json();

      const title = searchData?.query?.search?.[0]?.title;

      if (title) {
        const summary = await fetch(
          `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        );
        const sumData = await summary.json();
        info = sumData.extract || "";
      }
    } catch {}

    // 🤖 IA PRINCIPAL
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos una IA conversacional tipo ChatGPT.

Usuario: ${name || "usuario"}

Información encontrada:
${info}

Pregunta: ${message}

Reglas:
- Respondé natural y claro
- Podés hablar de cualquier tema
- Si hay info arriba, usala
- Si no, respondé igual con conocimiento general
- Nunca digas "no sé"
`
      })
    });

    const data = await aiRes.json();

    let reply = data.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      reply = "No pude generar respuesta 😅";
    }

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error del servidor ⚠️" });
  }
}