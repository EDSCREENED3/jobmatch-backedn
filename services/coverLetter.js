const axios = require('axios');

async function cohereChat(message) {
  try {
    const res = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command-r',
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return res.data.text.trim();
  } catch (err) {
    const res = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt: message,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return res.data.generations[0].text.trim();
  }
}

async function generateCoverLetter(cvText, jobTitle, company, jobDescription = '') {
  const message = `You are an expert career coach. Write a compelling cover letter (3 paragraphs, about 200 words) for this candidate.

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

  return await cohereChat(message);
}

async function tailorCVSummary(cvText, jobTitle, company) {
  const message = `Write a 2-3 sentence professional CV summary for this candidate applying for ${jobTitle} at ${company}.

CV: ${cvText.slice(0, 1500)}

Write only the summary, nothing else:`;

  return await cohereChat(message);
}

module.exports = { generateCoverLetter, tailorCVSummary };
