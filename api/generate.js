// api/generate.js — fonction serverless Vercel pour DAA Studio (CommonJS)
//
// POST JSON : { productName, prompt, imageBase64 (JPEG brut, sans préfixe), mode }
//   mode : 'packaging' | 'publicite' | 'fiche'
//
// Réponse 200 : { image?, copy?, degraded?, notice? }
//   - image    : data URL (image produite par Muse Image, ou photo d'origine en secours)
//   - copy     : texte de vente (Baseten / Muse Spark Open)
//   - degraded : true si la transformation visuelle n'a pas pu être faite (le studio ne débite alors AUCUN crédit)
// Seules les requêtes invalides renvoient 4xx. Une panne ou un quota côté Meta/Baseten renvoie 200 + degraded.
//
// Variables d'environnement (Vercel → Settings → Environment Variables) :
//   META_MODEL_API_KEY  clé Meta Model API (dev.meta.ai)            → Muse Image + SAM 3.1
//   BASETEN_API_KEY     clé Baseten                                  → texte de vente
//   SAM_ENABLED=0       (optionnel) désactive l'étape SAM 3.1
//   META_API_BASE, MUSE_IMAGE_MODEL, LLM_BASE_URL, LLM_MODEL (optionnels, valeurs par défaut ci-dessous)

'use strict';

const MODES = ['packaging', 'publicite', 'fiche'];
const MAX_NAME = 80;
const MAX_PROMPT = 500;
const MAX_IMAGE_B64 = 3000000;            // ≈ 2,2 Mo de JPEG (limite Vercel du corps de requête : 4,5 Mo)
const MAX_OUT_B64 = 4000000;              // limite Vercel de la réponse : 4,5 Mo

const META_BASE = process.env.META_API_BASE || 'https://api.meta.ai/v1';
const MUSE_MODEL = process.env.MUSE_IMAGE_MODEL || 'muse-image-1.0';
const SAM_MODEL = 'sam-3.1';
const SAM_ENABLED = process.env.SAM_ENABLED !== '0';

const LLM_URL = process.env.LLM_BASE_URL || 'https://bridge.baseten.co/v1/chat/completions';
const LLM_MODEL = process.env.LLM_MODEL || 'meta-models/muse-spark-open-1026';

const SAM_TIMEOUT_MS = 8000;
const MUSE_TIMEOUT_MS = 55000;
const LLM_TIMEOUT_MS = 25000;

const SYSTEM_PROMPT =
  "Tu es un expert en copywriting e-commerce pour les créateurs et artisans d'Afrique de l'Ouest. " +
  'Rédige en français un texte court (80 mots maximum), séduisant et percutant, adapté à WhatsApp et Instagram, avec quelques émojis. ' +
  "N'invente JAMAIS de prix, de numéro de téléphone, de matière ou de caractéristique qui ne figurent pas dans la demande : " +
  'écris [prix en FCFA] et [votre numéro WhatsApp] comme espaces réservés. Réponds uniquement avec le texte final.';

// ---------- utilitaires ----------
function clean(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

async function fetchT(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function mimeOf(b64) {
  if (b64.startsWith('/9j/')) return 'image/jpeg';
  if (b64.startsWith('UklGR')) return 'image/webp';
  return 'image/png';
}

function fallbackCopy(productName) {
  return productName + '\n\nUne création soignée, pensée pour durer et pour vous distinguer.\n\n' +
    'Prix : [prix en FCFA]\nCommande et livraison : écrivez-nous sur WhatsApp au [votre numéro WhatsApp]';
}

// ---------- texte de vente (Baseten) ----------
async function generateCopy({ productName, prompt }) {
  const r = await fetchT(LLM_URL, {
    method: 'POST',
    headers: { Authorization: 'Api-Key ' + process.env.BASETEN_API_KEY.trim(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Produit : ' + productName + '.\nSouhaits de mise en avant : ' + (prompt || 'mise en valeur haut de gamme') + '.' }
      ],
      max_tokens: 900,     // marge : un modèle « raisonnement » consomme des tokens avant de répondre
      temperature: 0.7
    })
  }, LLM_TIMEOUT_MS);
  if (!r.ok) throw new Error('llm_http_' + r.status);
  const data = await r.json();
  const text = String(data?.choices?.[0]?.message?.content ?? '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (!text) throw new Error('llm_empty');
  return text;
}

// ---------- SAM 3.1 : localise le produit (boîte englobante) ----------
// Étape facultative : en cas d'échec ou de produit non trouvé, on continue sans.
async function locateProduct(imageBase64, concept) {
  const r = await fetchT(META_BASE + '/responses', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.META_MODEL_API_KEY.trim(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: SAM_MODEL,
      input: [{ role: 'user', content: [
        { type: 'input_text', text: concept },
        { type: 'input_image', image_url: 'data:image/jpeg;base64,' + imageBase64 }
      ] }]
    })
  }, SAM_TIMEOUT_MS);
  if (!r.ok) throw new Error('sam_http_' + r.status);
  const raw = (await r.text()).replace(/\\u003c/gi, '<').replace(/\\u003e/gi, '>').replace(/\\u007c/gi, '|');
  // Grammaire documentée : <|box;x1=..;y1=..;x2=..;y2=..;w=..;h=..|>
  const re = /<\|box;x1=(\d+);y1=(\d+);x2=(\d+);y2=(\d+);w=(\d+);h=(\d+)/g;
  let best = null, m;
  while ((m = re.exec(raw))) {
    const [x1, y1, x2, y2, w, h] = m.slice(1).map(Number);
    const area = (x2 - x1) * (y2 - y1);
    if (w > 0 && h > 0 && area > 0 && (!best || area > best.area)) best = { x1, y1, x2, y2, w, h, area };
  }
  return best;
}

function boxHint(b) {
  const p = v => Math.max(0, Math.min(100, Math.round(v * 100)));
  return 'A segmentation pass located the product inside the region spanning ' + p(b.x1 / b.w) + '% to ' + p(b.x2 / b.w) +
    '% horizontally and ' + p(b.y1 / b.h) + '% to ' + p(b.y2 / b.h) + '% vertically of the photo.';
}

// ---------- Muse Image ----------
function visualPrompt(mode, userText, hint) {
  const wishes = userText
    ? ' Customer instructions (in French, they take priority for the aspects they mention, including the desired decor): ' + userText
    : '';
  if (mode === 'packaging') {
    return 'Professional luxury product photography retouch. Keep the product from the photo exactly identical: same shape, colors, ' +
      'label, logo and text, do not redraw or alter it. Remove the original background and place the product, centered and fully visible, ' +
      'on a premium set with soft studio lighting, a realistic contact shadow and subtle reflections, high-end e-commerce look. ' +
      'No added text, no watermark.' + (hint ? ' ' + hint : '') + wishes;
  }
  return 'Create a striking, high-end advertising poster for this product. Keep the product from the photo recognisable and faithful ' +
    '(same shape, colors, label and logo). Bold professional composition, cinematic lighting, premium commercial look. ' +
    'Avoid long text; no watermark.' + wishes;
}

function imageFromResponse(data) {
  const item = data?.data?.[0];
  if (item?.b64_json) {
    if (item.b64_json.length > MAX_OUT_B64) throw new Error('muse_too_large');
    return 'data:' + mimeOf(item.b64_json) + ';base64,' + item.b64_json;
  }
  if (item?.url) return item.url;
  throw new Error('muse_empty');
}

async function museEdit(imageBase64, prompt) {
  const form = new FormData();                       // multipart, comme images.edit d'OpenAI
  form.append('model', MUSE_MODEL);
  form.append('prompt', prompt);
  form.append('n', '1');
  form.append('image', new Blob([Buffer.from(imageBase64, 'base64')], { type: 'image/jpeg' }), 'photo.jpg');
  const r = await fetchT(META_BASE + '/images/edits', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.META_MODEL_API_KEY.trim() },   // pas de Content-Type : fetch ajoute la limite multipart
    body: form
  }, MUSE_TIMEOUT_MS);
  if (!r.ok) { console.error('Muse edit non-OK', r.status, (await r.text()).slice(0, 300)); throw new Error('muse_http_' + r.status); }
  return imageFromResponse(await r.json());
}

async function museGenerate(prompt) {
  const r = await fetchT(META_BASE + '/images/generations', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.META_MODEL_API_KEY.trim(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MUSE_MODEL, prompt, n: 1 })
  }, MUSE_TIMEOUT_MS);
  if (!r.ok) { console.error('Muse generate non-OK', r.status, (await r.text()).slice(0, 300)); throw new Error('muse_http_' + r.status); }
  return imageFromResponse(await r.json());
}

async function makeVisual({ mode, imageBase64, userText, productName }) {
  if (!process.env.META_MODEL_API_KEY) throw new Error('META_MODEL_API_KEY manquante');
  if (!imageBase64) return museGenerate(visualPrompt(mode, userText, '') + ' Product: ' + productName + '.');

  let hint = '';
  if (mode === 'packaging' && SAM_ENABLED) {
    try {
      const generic = /^(produit|cr[ée]ation artisanale)$/i.test(productName) || productName.length > 40;
      const box = await locateProduct(imageBase64, generic ? 'product' : productName);
      if (box) hint = boxHint(box);
    } catch (e) {
      console.warn('SAM ignoré :', e && e.message);   // jamais bloquant
    }
  }
  return museEdit(imageBase64, visualPrompt(mode, userText, hint));
}

// ---------- gestionnaire ----------
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Appels depuis un autre site refusés
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch (e) {}
    if (host !== req.headers.host) return res.status(403).json({ error: 'Origine refusée' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const mode = body.mode;
  if (!MODES.includes(mode)) return res.status(400).json({ error: 'Mode invalide' });

  const productName = clean(body.productName, MAX_NAME) || 'Création artisanale';
  const userText = clean(body.prompt, MAX_PROMPT);
  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';

  if (imageBase64) {
    if (imageBase64.length > MAX_IMAGE_B64) return res.status(413).json({ error: 'Photo trop lourde' });
    if (!imageBase64.startsWith('/9j/') || !/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
      return res.status(400).json({ error: 'Photo invalide (JPEG attendu)' });
    }
  }
  if (mode === 'packaging' && !imageBase64) return res.status(400).json({ error: 'Une photo est nécessaire pour ce mode' });

  // Visuel (Meta) et texte (Baseten) en parallèle
  const wantVisual = mode !== 'fiche';
  const [visualRes, copyRes] = await Promise.allSettled([
    wantVisual ? makeVisual({ mode, imageBase64, userText, productName }) : Promise.resolve(null),
    process.env.BASETEN_API_KEY ? generateCopy({ productName, prompt: userText }) : Promise.reject(new Error('BASETEN_API_KEY manquante'))
  ]);

  if (visualRes.status === 'rejected') console.error('Visuel indisponible :', visualRes.reason && visualRes.reason.message);
  if (copyRes.status === 'rejected') console.error('Texte indisponible :', copyRes.reason && copyRes.reason.message);

  const copyOk = copyRes.status === 'fulfilled';
  const copy = copyOk ? copyRes.value : fallbackCopy(productName);
  const visualOk = wantVisual && visualRes.status === 'fulfilled';

  // Tout est passé : réponse normale
  if (copyOk && (!wantVisual || visualOk)) {
    return res.status(200).json(visualOk ? { image: visualRes.value, copy } : { copy });
  }
  if (visualOk) return res.status(200).json({ image: visualRes.value, copy });   // visuel OK, texte de secours

  // Secours : l'artisan n'est jamais bloqué, mais rien n'est débité (degraded: true)
  const out = { copy, degraded: true };
  if (wantVisual && imageBase64) {
    out.image = 'data:image/jpeg;base64,' + imageBase64;     // photo d'origine, non transformée
    out.notice = 'Le service de transformation est momentanément saturé : voici votre photo d’origine avec le texte de vente. Aucun crédit n’est débité, réessayez dans quelques minutes.';
  } else if (wantVisual) {
    out.notice = 'Le service de génération d’image est momentanément saturé : voici le texte de vente. Aucun crédit n’est débité, réessayez dans quelques minutes.';
  } else {
    out.notice = 'Le service de rédaction est momentanément saturé : voici un texte modèle à compléter. Aucun crédit n’est débité, réessayez dans quelques minutes.';
  }
  return res.status(200).json(out);
};