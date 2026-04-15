const axios = require('axios');

async function groqChat(message) {
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: message }],
      max_tokens: 600,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return res.data.choices[0].message.content.trim();
}

async function generateCoverLetter(cvText, jobTitle, company, jobDescription = '') {
  const message = `Write a compelling cover letter (3 paragraphs, about 200 words) for this candidate.

CV:
${cvText.slice(0, 2000)}

Role: ${jobTitle} at ${company}
${jobDescription ? 'Job Description: ' + jobDescription.slice(0, 600) : ''}

Rules:
- Strong opening hook specific to the company
- Highlight most relevant skills from the CV
- Clear call to action at the end
- Natural tone, no "I am writing to apply" cliches
- Plain text only, no headers or bullet points

Write the cover letter now:`;

  return await groqChat(message);
}

async function tailorCVSummary(cvText, jobTitle, company) {
  const message = `Write a 2-3 sentence professional CV summary for this candidate applying for ${jobTitle} at ${company}.

CV: ${cvText.slice(0, 1500)}

Write only the summary, nothing else:`;

  return await groqChat(message);
}

module.exports = { generateCoverLetter, tailorCVSummary };
