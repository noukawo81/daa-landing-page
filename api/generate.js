// api/generate.js — Relais serveur sécurisé DAA spécial Hackathon Meta
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode POST requise' });
  }

  try {
    const { mode, productName, prompt, imageBase64, actionType } = req.body;

    const META_API_KEY = process.env.META_MODEL_API_KEY;
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
    const BASETEN_API_KEY = process.env.BASETEN_API_KEY;

    let generatedText = "";
    let generatedImageUrl = "";

    // 1. RÉDACTION COMMERCIALE (META LLAMA 3.1)
    if (FIREWORKS_API_KEY || BASETEN_API_KEY) {
      try {
        const endpoint = FIREWORKS_API_KEY 
          ? "https://api.fireworks.ai/inference/v1/chat/completions"
          : "https://model-api.baseten.co/v1/chat/completions";

        const auth = FIREWORKS_API_KEY ? `Bearer ${FIREWORKS_API_KEY}` : `Api-Key ${BASETEN_API_KEY}`;

        const llamaResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": auth,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
            messages: [
              {
                role: "system",
                content: "Tu es le moteur marketing IA de la Digital Artisans Academy (DAA). Rédige une fiche de vente persuasive pour artisans et PME en Côte d'Ivoire. Reste concis : 1 titre percutant, 2 phrases de valeur, prix indicatif en FCFA et un appel à l'action WhatsApp."
              },
              {
                role: "user",
                content: `Produit : ${productName || 'Création artisanale'}. Souhaits du créateur : ${prompt || 'Finition luxe'}.`
              }
            ],
            max_tokens: 220,
            temperature: 0.7
          })
        });

        const llamaData = await llamaResponse.json();
        if (llamaData.choices && llamaData.choices[0]) {
          generatedText = llamaData.choices[0].message.content;
        }
      } catch (err) {
        console.warn("Secours Llama local activé :", err);
      }
    }

    // 2. GÉNÉRATION OU RETOUCHE VISUELLE (META MODEL API : SAM 3.1 / MUSE IMAGE)
    if (META_API_KEY) {
      try {
        // Text-to-Image (Muse Image) ou Segmentation de produit (SAM 3.1)
        const metaResponse = await fetch("https://api.meta.ai/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${META_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "muse-image-1.0",
            prompt: `High-end commercial product photography of ${productName || 'African artisan product'}, ${prompt}, professional luxury studio lighting, 8k resolution, photorealistic`,
            response_format: "url"
          })
        });

        const metaData = await metaResponse.json();
        if (metaData.data && metaData.data[0]) {
          generatedImageUrl = metaData.data[0].url;
        }
      } catch (err) {
        console.warn("Secours graphique activé :", err);
      }
    }

    // Réponse de secours propre et structurée
    const defaultText = `${productName || 'Votre Produit'}\n\nUne création authentique, soignée et pensée pour valoriser votre savoir-faire.\n\nPrix : Sur mesure en FCFA\nCommande & Livraison : écrivez-nous sur WhatsApp au +225 05 44 18 81 55`;

    return res.status(200).json({
      success: true,
      text: generatedText || defaultText,
      imageUrl: generatedImageUrl || null
    });

  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({ error: "Erreur interne de traitement" });
  }
}