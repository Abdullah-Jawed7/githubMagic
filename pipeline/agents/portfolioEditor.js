// agents/portfolioEditor.js
import { Agent } from "@openai/agents";

export async function editPortfolio(update, fileContent, filePath) {
  const instructions = `
You are Portfolio Editor.
Update the portfolio file so the new update is reflected.

Rules:
- If type = "project update", modify Projects.jsx and add a new card.
- If type = "skill update", modify Skill.jsx and add new skill.
- If type = "education update", modify Edu.jsx.
- If type = "bio update", modify About.jsx.
- Preserve existing JSX and TailwindCSS structure.
- Return only the FULL updated file.
`

const prompt = `
Update data:
${JSON.stringify(update, null, 2)}

File path: ${filePath}
File content:
\`\`\`jsx
${fileContent}
\`\`\`
  `;

const portfolioEditor = new Agent({
    name:"Portfolio Editor",
    instructions:instructions,
})
const result  = await runner.run(portfolioEditor ,prompt )
return result.finalOutput;
}
