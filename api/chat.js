export default async function handler(req, res) {
  const { message, name } = req.body;
  const text = message.toLowerCase();

  // 🧠 respuestas humanas básicas
  if (text.includes("gracias")) {
    return res.json({ reply: `${name || ""} de nada 🚆` });
  }

  if (text.includes("hola")) {
    return res.json({ reply: `Hola ${name || ""} 👋` });
  }

  // 📚 base MUCHO más completa
  const db = [
    {
      keys:["nca","nuevo central argentino"],
      value:"NCA es una empresa privada de cargas que opera principalmente en el centro del país."
    },
    {
      keys:["ferrosur"],
      value:"Ferrosur Roca transporta cargas en el sur de Buenos Aires y conecta con puertos."
    },
    {
      keys:["mitre"],
      value:"La línea Mitre usa trenes eléctricos CSR chinos en el ramal Tigre y diésel en otros ramales."
    },
    {
      keys:["roca"],
      value:"La línea Roca conecta Constitución con zona sur y usa trenes eléctricos modernos."
    },
    {
      keys:["sarmiento"],
      value:"La línea Sarmiento conecta Once con Moreno usando trenes eléctricos."
    },
    {
      keys:["belgrano cargas"],
      value:"Belgrano Cargas transporta granos y productos en el norte argentino."
    },
    {
      keys:["tren de carga","carga"],
      value:"En Argentina destacan NCA, Ferrosur Roca y Belgrano Cargas como principales operadores."
    }
  ];

  function search(text){
    for (let item of db){
      for (let k of item.keys){
        if(text.includes(k)){
          return item.value;
        }
      }
    }
    return null;
  }

  // 🔍 BUSCAR PRIMERO EN BASE
  const found = search(text);

  if(found){
    return res.json({
      reply: `${name ? name + ", " : ""}${found}`
    });
  }

  // 🤖 SI NO ENCUENTRA → IA REAL
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Respondé como experto en trenes argentinos.

Usuario: ${name}
Pregunta: ${message}

Reglas:
- Nunca digas "no tengo info"
- Explicá aunque no sea exacto
- Respondé natural
`
      })
    });

    const data = await response.json();

    let reply = data.output?.[0]?.content?.[0]?.text;

    if(!reply){
      reply = `${name ? name + ", " : ""}eso está relacionado con trenes argentinos 🚆`;
    }

    res.json({ reply });

  } catch {
    res.json({
      reply: `${name ? name + ", " : ""}hubo un error buscando info 🚆`
    });
  }
}