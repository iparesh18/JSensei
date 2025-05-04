// api/chat.js
export default async function handler(req, res) {
    const { prompt } = req.body;
  
    try {
      // Make the request to OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // Using environment variable
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
  
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Sensei is silent...";
  
      res.status(200).json({ reply });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to fetch from OpenRouter' });
    }
  }
  