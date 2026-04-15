const { openai } = require('../utils/embeddings');

/**
 * Generate a tailored cover letter for a specific job.
 */
async function generateCoverLetter(cvText, jobTitle, company, jobDescription = '') {
  const systemPrompt = `You are an expert career coach and professional writer.
Write a compelling, concise cover letter (3 paragraphs, ~200 words) that:
- Opens with a strong hook specific to the company and role
- Highlights the most relevant skills/experience from the CV
- Closes with a clear call to action
- Sounds natural, not AI-generated
- Avoids clichés like "I am writing to apply..."
Format: Plain text, no headers, no placeholders.`;

  const userPrompt = `CV:
${cvText.slice(0, 3000)}

Role: ${jobTitle} at ${company}
${jobDescription ? `Job Description (excerpt): ${jobDescription.slice(0, 1000)}` : ''}

Write the cover letter now:`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 400,
    temperature: 0.7,
  });

  return res.choices[0].message.content.trim();
}

/**
 * Generate a tailored CV summary/objective for a specific job.
 */
async function tailorCVSummary(cvText, jobTitle, company) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a CV expert. Write a 2-3 sentence professional summary tailored to the specific job. Be specific and quantified where possible.',
      },
      {
        role: 'user',
        content: `CV: ${cvText.slice(0, 2000)}\nTarget role: ${jobTitle} at ${company}\nWrite the summary:`,
      },
    ],
    max_tokens: 150,
  });

  return res.choices[0].message.content.trim();
}

module.exports = { generateCoverLetter, tailorCVSummary };
