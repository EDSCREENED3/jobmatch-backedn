const axios = require('axios');

async function groqChat(message) {
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach specialising in finance, fintech and law graduate roles in London. Write compelling, specific cover letters that highlight quantified achievements and relevant experience. Never use generic phrases. Always sound like a real person, not AI.'
        },
        { role: 'user', content: message }
      ],
      max_tokens: 700,
      temperature: 0.75,
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
  const message = `Write a highly tailored, compelling cover letter for this candidate. 3 paragraphs, 200-250 words.

CANDIDATE BACKGROUND:
${cvText.slice(0, 3000)}

TARGET ROLE: ${jobTitle} at ${company}
${jobDescription ? 'JOB DESCRIPTION: ' + jobDescription.slice(0, 800) : ''}

REQUIREMENTS:
- Paragraph 1: Strong specific hook mentioning ${company} by name and why this role
- Paragraph 2: Pick 2-3 most relevant achievements from the CV with specific details (grades, projects, internship work)
- Paragraph 3: Forward-looking close with clear call to action
- Tone: Confident, intelligent, natural — like a top law/finance graduate would write
- NO "I am writing to apply", NO generic phrases, NO bullet points
- Reference specific CV details like the MSc distinction grades, fintech internship, or dissertation topic where relevant

Write the cover letter:`;

  return await groqChat(message);
}

async function tailorCVSummary(cvText, jobTitle, company) {
  const message = `Write a punchy 2-3 sentence professional summary for this candidate applying for ${jobTitle} at ${company}.

CV: ${cvText.slice(0, 2000)}

Make it specific to the role. Reference their MSc, fintech background or relevant experience. No generic phrases.`;

  return await groqChat(message);
}

module.exports = { generateCoverLetter, tailorCVSummary };
