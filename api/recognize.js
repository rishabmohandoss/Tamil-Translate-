export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

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
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: imageBase64 }
          },
          {
            type: 'text',
            text: `You are an expert in Tamil script. A user has handwritten their name in Tamil on a white canvas.

Carefully examine each character from left to right. Tamil letters have distinct shapes — pay close attention to curves, loops, and diacritical marks (vowel signs) attached to consonants. Do not guess based on common names; read exactly what is drawn.

Steps:
1. Identify each Tamil character individually
2. Combine them into the full Tamil Unicode string
3. Transliterate to English using standard Tamil romanization

Respond ONLY with valid JSON, no explanation:
{ "tamil": "...", "english": "..." }`
          }
        ]
      }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(response.status).json({ error: err?.error?.message || 'API error' });
  }

  const data = await response.json();
  return res.status(200).json({ text: data.content?.[0]?.text || '' });
}
