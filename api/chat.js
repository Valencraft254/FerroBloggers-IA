export default async function handler(req, res) {
  try {
    let { message } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    // 🔎 1. LEER TU WEB
    let contenido = "";

    try {
      const page = await fetch("https://infotrain-dtgv.vercel.app/");
      const html = await page.text();

      contenido = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ");

    } catch (e) {
      console.log("error leyendo web", e);
    }

    // ✂️ 2. CORTAR TEXTO (importante para IA)
    const textoCorto = contenido.slice(0, 4000);

    // 🤖 3. IA GENERA RESPUESTA
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

Usá SOLO esta información de la web:
${textoCorto}

Pregunta del usuario:
${message}

Respondé como una explicación natural (no copies texto).
Si no encontrás info, decí:
"No entendí, ¿me explicás de nuevo? 🇦🇷"
`
      })
    });

    const data = await ai.json();

    let reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "No entendí, ¿me explicás de nuevo? 🇦🇷";

`;

    res.json({ reply });

  } catch (e) {
    console.error(e);
    res.json({ reply: "Error ⚠️" });
  }
}