export default async function handler(req, res) {

  try {
    let { message, name } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    // 🧠 diccionario de correcciones
    const corrections = {
      "ola":"hola",
      "holaa":"hola",
      "komo":"como",
      "ke":"que",
      "k":"que",
      "trn":"tren",
      "trenens":"trenes",
      "ferosur":"ferrosur",
      "ferrosurr":"ferrosur",
      "metrovias":"metrovías",
      "sarmientoo":"sarmiento",
      "mitree":"mitre",
      "rokca":"roca",
      "sanmartn":"san martin",
      "belgran":"belgrano",
      "n c a":"nca"
    };

    // 🔧 normalizar
    let fixed = message.toLowerCase();

    for (let wrong in corrections) {
      const regex = new RegExp(`\\b${wrong}\\b`, "g");
      fixed = fixed.replace(regex, corrections[wrong]);
    }

    // 🚆 detectar si es tema tren
    const trainWords = [
      "tren","trenes","linea","estacion","ramal",
      "roca","sarmiento","mitre","san martin",
      "belgrano","urquiza","nca","ferrosur",
      "cargas","subte"
    ];

    const isTrain = trainWords.some(w => fixed.includes(w));

    // 💬 saludo
    if (fixed.includes("hola")) {
      return res.json({
        reply: `Hola ${name || ""} 👋 ¿Qué querés saber sobre trenes argentinos?`
      });
    }

    if (fixed.includes("gracias")) {
      return res.json({
        reply: `${name || ""} de nada 🚆`
      });
    }

    // ❌ fuera de tema
    if (!isTrain) {
      return res.json({
        reply: "Solo puedo dar información de trenes argentinos 🚆"
      });
    }

    // 🤖 IA
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

Usuario: ${name || "usuario"}

Mensaje original: ${message}
Mensaje corregido: ${fixed}

Reglas:
- Responder claro
- Usar el mensaje corregido
- Solo trenes argentinos
- Explicar bien

Pregunta: ${fixed}
`
      })
    });

    const data = await ai.json();
    let reply = data?.output?.[0]?.content?.[0]?.text;

    if (!reply) {
      reply = "Solo puedo dar información de trenes argentinos 🚆";
    }

    res.json({ reply });

  } catch {
    res.json({ reply: "Error ⚠️" });
  }
}