const text = message.toLowerCase();

// respuestas directas importantes
if (text.includes("ferrosur")) {
  return res.json({
    reply: `${name ? name + ", " : ""}Ferrosur Roca es una empresa de trenes de carga en Argentina que transporta materiales como cemento, piedra y granos por la red del Ferrocarril Roca.`
  });
}

if (text.includes("nca") || text.includes("nuevo central argentino")) {
  return res.json({
    reply: `${name ? name + ", " : ""}NCA es una empresa privada de trenes de carga que opera en el centro del país.`
  });
}

if (text.includes("metrovias")) {
  return res.json({
    reply: `${name ? name + ", " : ""}Metrovías operó el subte de Buenos Aires y la línea Urquiza.`
  });
}