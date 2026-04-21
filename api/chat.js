export default async function handler(req, res) {

  try {
    const { message, name } = req.body;

    // 🧠 1. CORREGIR TEXTO
    let fixed = message;

    try {
      const spell = await fetch(
        `https://api.api-ninjas.com/v1/spellcheck?text=${encodeURIComponent(message)}`,
        {
          headers: { "X-Api-Key": process.env.SPELL_API_KEY }
        }
      );

      const data = await spell.json();

      // si hay sugerencias, usamos la primera
      if (data?.corrections && data.corrections.length > 0) {
        fixed = data.corrections[0].corrected || message;
      }

    } catch (e) {
      console.log("spell error", e);
    }

    // 🧠 2. DETECTAR SI ES TREN
    const text = fixed.toLowerCase();

    const isTrain = [
      "tren","linea","roca","sarmiento","mitre",
      "san martin","belgrano","nca","ferrosur",
      "cargas","estacion"
    ].some(k => text.includes(k));

    if (!isTrain) {
      return res.json({
        reply: "Solo puedo dar información de trenes argentinos 🚆"
      });
    }

    // 🤖 3. IA RESPUESTA EDUCADA
    const ai = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos Ferrobloggers 🚆

Usuario: ${name || "usuario"}

Mensaje original: ${message}
Mensaje corregido: ${fixed}

Reglas:
- Respondé educadamente
- Entendé errores de escritura
- Solo trenes argentinos
- Si es saludo, responder amable

Pregunta: ${fixed}
`
      })
    });

    const aiData = await ai.json();

    let reply = aiData?.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      reply = "Solo puedo dar información de trenes argentinos 🚆";
    }

    res.json({ reply });

  } catch {
    res.json({ reply: "Error ⚠️" });
  }
}