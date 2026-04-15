const { generateText } = require('../utils/embeddings');

/**
 * Generate a tailored cover letter for a specific job.
 */
async function generateCoverLetter(cvText, jobTitle, company, jobDescription = '') {
  const prompt = `You are an expert career coach. Write a compelling, concise cover letter (3 paragraphs, ~200 words) for this candidate.

CV:
${cvText.slice(0, 2000)}

Role: ${jobTitle} at ${company}
${jobDescription ? `Job Description: ${jobDescription.slice(0, 800)}` : ''}

Rules:
- Opens with a strong hook specific to the company and role
- Highlights the most relevant skills from the CV
- Closes with a clear call to action
- Sounds natural, not AI-generated
- No "I am writing to apply..." clichés
- Plain text only, no headers

Cover letter:`;

  return await generateText(prompt);
}

/**
 * Generate a tailored CV summary for a specific job.
 */
async function tailorCVSummary(cvText, jobTitle, company) {
  const prompt = `Write a 2-3 sentence professional CV summary for this candidate applying for ${jobTitle} at ${company}.

CV: ${cvText.slice(0, 1500)}

Summary:`;

  return await generateText(prompt);
}

module.exports = { generateCoverLetter, tailorCVSummary };
