// api/generate.js — fonction serverless Vercel pour DAA Studio
//
// Entrée  (POST JSON) : { productName, prompt, imageBase64 (JPEG brut, sans préfixe), mode }
//   mode : 'packaging' | 'publicite' | 'fiche'
// Sortie  (200)       : { image?: "data:image/jpeg;base64,...", copy?: "texte de vente" }
// Erreurs             : 4xx/5xx avec { error } → le studio ne débite alors AUCUN crédit.
//
// Variables d'environnement (Vercel → Settings → Environment Variables) :
//   BASETEN_API_KEY   (obligatoire)  clé Baseten
//   LLM_BASE_URL      (optionnel)    défaut : https://bridge.baseten.co/v1/chat/completions
//   LLM_MODEL         (optionnel)    défaut : meta-models/muse-spark-open-1026
//   DAA_DEMO_MODE=1   (optionnel)    DÉMO PRIVÉE UNIQUEMENT : renvoie la photo d'origine comme « visuel »

const MODES = ['packaging', 'publicite', 'fiche'];
const MAX_NAME = 80;
const MAX_PROMPT = 500;
const MAX_IMAGE_B64 = 3_000_000;          // ≈ 2,2 Mo de JPEG (la limite Vercel du corps est de 4,5 Mo)
const LLM_TIMEOUT_MS = 25_000;

const LLM_URL = process.env.LLM_BASE_URL || 'https://bridge.baseten.co/v1/chat/completions';
const LLM_MODEL = process.env.LLM_MODEL || 'meta-models/muse-spark-open-1026';
const DEMO = process.env.DAA_DEMO_MODE === '1';

const SYSTEM_PROMPT =
  "Tu es un expert en copywriting e-commerce pour les créateurs et artisans d'Afrique de l'Ouest. " +
  'Rédige en français un texte court (80 mots maximum), séduisant et percutant, adapté à WhatsApp et Instagram, avec quelques émojis. ' +
  "N'invente JAMAIS de prix, de numéro de téléphone, de matière ou de caractéristique qui ne figurent pas dans la demande : " +
  'écris [prix en FCFA] et [votre numéro WhatsApp] comme espaces réservés. Réponds uniquement avec le texte final.';

// Texte nettoyé : caractères de contrôle retirés (sauf retours à la ligne), longueur limitée
function clean(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

async function generateCopy({ productName, prompt }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    const r = await fetch(LLM_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Api-Key ${process.env.BASETEN_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Produit : ${productName}.\nSouhaits de mise en avant : ${prompt || 'mise en valeur haut de gamme'}.` }
        ],
        // Marge volontaire : un modèle « raisonnement » consomme des tokens avant de répondre
        max_tokens: 900,
        temperature: 0.7
      })
    });
    if (!r.ok) {
      console.error('LLM non-OK', r.status, (await r.text()).slice(0, 300));
      throw new Error('llm_http_' + r.status);
    }
    const data = await r.json();
    const text = String(data?.choices?.[0]?.message?.content ?? '')
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .trim();
    if (!text) throw new Error('llm_empty');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// À BRANCHER : votre vrai pipeline visuel (détourage + décor premium, ou affiche publicitaire).
// Doit retourner une data URL ("data:image/png;base64,...") ou une URL https acceptant le CORS, ou null.
async function generateVisual({ mode, imageBase64 }) {
  if (DEMO && imageBase64) return 'data:image/jpeg;base64,' + imageBase64;   // démo : photo d'origine, non transformée
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Appels depuis un autre site refusés (protège contre l'usage de votre clé par des pages tierces)
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch (e) {}
    if (host !== req.headers.host) return res.status(403).json({ error: 'Origine refusée' });
  }

  if (!process.env.BASETEN_API_KEY) {
    console.error('BASETEN_API_KEY manquante');
    return res.status(500).json({ error: 'Service non configuré' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const mode = body.mode;
  if (!MODES.includes(mode)) return res.status(400).json({ error: 'Mode invalide' });

  const productName = clean(body.productName, MAX_NAME) || 'Création artisanale';
  const prompt = clean(body.prompt, MAX_PROMPT);
  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';

  if (imageBase64) {
    if (imageBase64.length > MAX_IMAGE_B64) return res.status(413).json({ error: 'Photo trop lourde' });
    if (!imageBase64.startsWith('/9j/') || !/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
      return res.status(400).json({ error: 'Photo invalide (JPEG attendu)' });
    }
  }
  if (mode === 'packaging' && !imageBase64) return res.status(400).json({ error: 'Une photo est nécessaire pour ce mode' });

  try {
    let image = null;
    if (mode !== 'fiche') {
      image = await generateVisual({ mode, imageBase64 });
      if (!image) return res.status(501).json({ error: 'Génération visuelle non disponible pour le moment' });
    }
    const copy = await generateCopy({ productName, prompt });
    return res.status(200).json(image ? { image, copy } : { copy });
  } catch (err) {
    console.error('generate:', err && err.message ? err.message : err);
    return res.status(502).json({ error: 'Service de création momentanément indisponible' });
  }
}