// agents/commitAnalyzer.js
import { Agent } from "@openai/agents";
import { runner } from "../../config.js";
import { z } from "zod";


export async function analyzeCommit(commitMessage, commitDiff) {
  const instructions = `
You are Commit Analyzer.
Look at this commit message and diff. Decide what update type it represents:
- project update
- skill update
- education update
- bio update
- other

Return JSON with fields: {type, title, description, link (if any), skills (if any)}.
`
const prompt = `
Commit message:
${commitMessage}

Diff:
${commitDiff}
  `;

  const AnalyzerResultType = z.object({
  type: z.string(),
  description: z.string(),
  link:z.array(z.string()).nullable(),
  skills: z.array(z.string()).nullable(),
});

const commitAnalyzer = new Agent({
    name:"Commit Analyzer",
    instructions:instructions,
    outputType:AnalyzerResultType,
})
const result  = await runner.run(commitAnalyzer ,prompt )
return result.finalOutput;
}
