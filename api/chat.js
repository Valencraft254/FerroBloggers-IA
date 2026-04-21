export default async function handler(req, res) {
  const { message, name } = req.body;

  // base simple de datos reales
  const db = {
    "nca": "Nuevo Central Argentino es una empresa privada de cargas que opera en el centro del país.",
    "ferrosur": "Ferrosur Roca opera trenes de carga principalmente en el sur de Buenos Aires y hacia la Patagonia.",
    "mitre": "La línea Mitre usa trenes eléctricos CSR chinos en el ramal Tigre y diésel en otros ramales.",
    "roca": "La línea Roca usa trenes eléctricos CSR y conecta Constitución con zona sur.",
    "sarmiento": "La línea Sarmiento usa trenes eléctricos CSR que van de Once a Moreno.",
    "belgrano cargas": "Belgrano Cargas transporta productos agrícolas en el norte del país.",
    "tren de carga": "En Argentina los más conocidos son NCA, Ferrosur Roca y Belgrano Cargas."
  };

  function searchDB(text){
    text = text.toLowerCase();
    for(let key in db){
      if(text.includes(key)) return db[key];
    }
    return null;
  }

  try {
    // intento IA
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content: `
Sos FerroBloggers 🚆 experto en trenes de Argentina.

- Respondé SIEMPRE con info útil
- Nunca digas "no tengo info"
- Si no sabés exacto, explicá igual
- Usá el nombre (${name}) si existe
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    let reply = data.output?.[0]?.content?.[0]?.text;

    // fallback si IA falla
    if (!reply || reply.toLowerCase().includes("no tengo")) {
      const dbResult = searchDB(message);

      if (dbResult) {
        reply = `${name ? name + ", " : ""}${dbResult}`;
      } else {
        reply = `${name ? name + ", " : ""}es un tema de trenes argentinos 🚆, por ejemplo NCA, Ferrosur o líneas como Mitre y Roca.`;
      }
    }

    res.status(200).json({ reply });

  } catch {
    res.status(200).json({
      reply: `${name ? name + ", " : ""}error al buscar datos 🚆`
    });
  }
}