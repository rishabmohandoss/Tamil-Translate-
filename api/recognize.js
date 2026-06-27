export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { segments } = req.body;
  if (!segments || !segments.length) {
    return res.status(400).json({ error: 'Missing segments' });
  }

  // Build content: label + image for each character crop, then final instruction
  const content = [];
  segments.forEach((b64, i) => {
    content.push({ type: 'text', text: `Character ${i + 1}:` });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } });
  });
  content.push({
    type: 'text',
    text: `You are a Tamil script expert. Above are ${segments.length} handwritten Tamil character(s), each shown in its own image, in left-to-right order.

For each image, identify the exact Tamil Unicode character by its shape — look at curves, loops, and any attached vowel marks. Do not infer or guess from context; read only what is drawn in each image.

Combine the characters in order to form the Tamil name, then provide the English transliteration.

Respond ONLY with valid JSON, no other text:
{ "tamil": "...", "english": "..." }`
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(response.status).json({ error: err?.error?.message || 'API error' });
  }

  const data = await response.json();
  return res.status(200).json({ text: data.content?.[0]?.text || '' });
}
