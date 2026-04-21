export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  try {
    const { message, name } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Mensaje vacío" });
    }

    const text = message.toLowerCase();

    // 🟢 RESPUESTAS BÁSICAS
    if (text.includes("hola")) {
      return res.json({ reply: `Hola ${name || ""} 👋` });
    }

    if (text.includes("gracias")) {
      return res.json({ reply: `${name || ""} de nada 🚆` });
    }

    if (text.includes("chau") || text.includes("adios")) {
      return res.json({ reply: `Chau ${name || ""} 👋` });
    }

    // 🚆 RESPUESTAS DE TRENES
    if (text.includes("ferrosur")) {
      return res.json({
        reply: `${name ? name + ", " : ""}Ferrosur Roca es una empresa de trenes de carga en Argentina que transporta cemento, piedra y granos por la red del Ferrocarril Roca.`
      });
    }

    if (text.includes("nca")) {
      return res.json({
        reply: `${name ? name + ", " : ""}NCA es una empresa privada de trenes de carga que opera en el centro del país.`
      });
    }

    if (text.includes("metrovias")) {
      return res.json({
        reply: `${name ? name + ", " : ""}Metrovías operó el subte de Buenos Aires y la línea Urquiza.`
      });
    }

    // 🤖 IA fallback
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `Respondé sobre trenes argentinos de forma clara. Pregunta: ${message}`
      })
    });

    const data = await response.json();
    const reply = data.output?.[0]?.content?.[0]?.text || "Error IA 🚆";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error del servidor ⚠️" });
  }
}