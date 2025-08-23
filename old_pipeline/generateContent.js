import { runner } from "../config.js";
import { Agent } from "@openai/agents";

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePortfolioUpdate({ repo, branch, commits }) {
  const commitText = commits.map(c => `- ${c.message} (${c.author})`).join("\n");

  const prompt = `
Repo: ${repo}
Branch: ${branch}

Recent commits:
${commitText}

Generate a short portfolio update in Markdown highlighting what’s new or improved.
`;

const contentGenerator = new Agent({
    name:'Content Generator',
    instructions:"Generate a update in Markdown Highlighting what's new or improved have happened ."
})

//   const res = await client.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }]
//   });


//   return res.choices[0].message.content.trim();

  const result = await runner.run( contentGenerator, prompt)
  console.log(result.finalOutput)
  return result.finalOutput
}
