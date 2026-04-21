export default async function handler(req, res) {

  try {
    let { message, name } = req.body || {};
    if (!message) return res.json({ reply: "Escribí algo 🚆" });

    const text = message.toLowerCase();

    // 💬 RESPUESTAS NORMALES
    if (text.includes("hola")) {
      return res.json({
        reply: `Hola ${name || ""} 👋 ¿Qué querés saber sobre trenes argentinos?`
      });
    }

    if (text.includes("gracias")) {
      return res.json({
        reply: `${name || ""} de nada 🚆`
      });
    }

    // 🚆 BASE DE DATOS
    const trains = {
      roca: {
        nombre: "Línea Roca",
        recorrido: "Constitución → La Plata / Ezeiza / Bosques",
        tipo: "eléctrico"
      },
      sarmiento: {
        nombre: "Línea Sarmiento",
        recorrido: "Once → Moreno",
        tipo: "eléctrico"
      },
      mitre: {
        nombre: "Línea Mitre",
        recorrido: "Retiro → Tigre / Suárez",
        tipo: "eléctrico"
      },
      sanmartin: {
        nombre: "Línea San Martín",
        recorrido: "Retiro → Pilar",
        tipo: "diésel"
      },
      nca: {
        nombre: "Nuevo Central Argentino",
        tipo: "cargas"
      },
      ferrosur: {
        nombre: "Ferrosur Roca",
        tipo: "cargas"
      }
    };

    // 🔎 BUSCAR COINCIDENCIA
    for (let key in trains) {
      if (text.includes(key)) {
        const t = trains[key];

        return res.json({
          reply: `
🚆 ${t.nombre}

Recorrido: ${t.recorrido || "—"}
Tipo: ${t.tipo || "—"}
`
        });
      }
    }

    // ❌ NO ES TREN
    const isTrain = ["tren","linea","roca","sarmiento","mitre","nca","ferrosur"]
      .some(k => text.includes(k));

    if (!isTrain) {
      return res.json({
        reply: "Solo puedo dar información de trenes argentinos 🚆"
      });
    }

    // 🤖 IA COMO RESPALDO
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

Usuario: ${name || ""}

Pregunta: ${message}

Respondé claro y útil.
`
      })
    });

    const data = await ai.json();

    const reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "Solo puedo dar información de trenes argentinos 🚆";

    res.json({ reply });

  } catch (e) {
    res.json({ reply: "Error ⚠️" });
  }
}