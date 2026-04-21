export default async function handler(req, res) {

  try {
    const { message, name } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    const normalize = (t) =>
      t.toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/\s+/g,"");

    const clean = normalize(message);

    // 🚆 palabras clave amplias (con errores incluidos)
    const keys = [
      "tren","trenes","ferrocarril","linea","estacion","ramal",
      "roca","sarmiento","mitre","sanmartin","belgrano","urquiza",
      "nca","ferrosur","cargas","subte","metrovias","sofse"
    ];

    const isTrain = keys.some(k => clean.includes(k));

    if (!isTrain) {
      return res.json({
        reply: "Solo puedo dar información de trenes argentinos 🚆"
      });
    }

    // 🤖 IA con base grande
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Sos Ferrobloggers 🚆 experto TOTAL en trenes argentinos.

BASE:
- Trenes Argentinos: pasajeros (Roca, Sarmiento, Mitre, San Martín, Belgrano Sur)
- NCA: cargas centro
- Ferrosur Roca: cargas sur
- Belgrano Cargas: norte
- Metrovías: subte y Urquiza

LÍNEAS:
- Roca, Sarmiento, Mitre, San Martín, Belgrano Sur, Urquiza

REGLAS:
- Entender errores (ej: "ferosur", "metrovias")
- Responder claro
- Usar nombre ${name || ""}
- Nunca salir del tema trenes

Pregunta: ${message}
`
      })
    });

    const data = await aiRes.json();
    const reply = data?.output?.[0]?.content?.[0]?.text
      || "Solo puedo dar información de trenes argentinos 🚆";

    res.json({ reply });

  } catch {
    res.json({ reply: "Error ⚠️" });
  }
}