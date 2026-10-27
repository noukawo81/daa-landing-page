export default async function handler(req, res) {
  // N'autoriser que les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { productName, prompt, imageBase64, mode } = req.body;

  const basetenKey = process.env.BASETEN_API_KEY;
  const metaKey = process.env.META_MODEL_API_KEY;

  let salesCopy = 'Découvrez notre création artisanale d\'exception, conçue avec soin et authenticité par nos artisans partenaires.';

  // 1. Appel du modèle de texte Llama / Muse Spark via Baseten
  if (basetenKey) {
    try {
      const basetenResponse = await fetch('https://bridge.baseten.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Api-Key ${basetenKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-models/muse-spark-open-1026',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en copywriting e-commerce pour les créateurs et artisans d\'Afrique de l\'Ouest. Rédige un texte court, séduisant et percutant adapté pour WhatsApp et Instagram, avec des émojis et le prix en FCFA.'
            },
            {
              role: 'user',
              content: `Produit: ${productName || 'Création artisanale'}. Souhaits de mise en avant: ${prompt || 'Mise en valeur haut de gamme'}.`
            }
          ],
          max_tokens: 250
        })
      });

      if (basetenResponse.ok) {
        const textData = await basetenResponse.json();
        if (textData.choices && textData.choices[0]?.message?.content) {
          salesCopy = textData.choices[0].message.content;
        }
      } else {
        const errorText = await basetenResponse.text();
        console.warn('Réponse Baseten non-OK:', basetenResponse.status, errorText);
      }
    } catch (apiError) {
      console.error('Erreur appel Baseten:', apiError);
    }
  }

  // 2. Gestion du visuel (renvoie la photo uploadée ou un modèle de démonstration haute définition)
  const visualUrl = imageBase64 
    ? imageBase64 
    : 'https://images.unsplash.com/photo-1608248597359-56135212574e?auto=format&fit=crop&w=800&q=80';

  // 3. Réponse 200 avec succès garanti pour l'interface utilisateur
  return res.status(200).json({
    success: true,
    visualUrl: visualUrl,
    salesCopy: salesCopy
  });
}