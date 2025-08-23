import { Octokit } from "@octokit/rest";
import { v4 as uuidv4 } from "uuid";
import { github_token, portfolio_repo } from "../env.js"

const octokit = new Octokit({ auth: github_token });

export async function createPortfolioPR({ content, repo, branch }) {
  const [owner, portfolioRepo] = portfolio_repo.split("/");

  const newBranch = `auto-update-${uuidv4().slice(0, 8)}`;
  const path = `content/updates/${Date.now()}.md`;

  // 1. Get default branch SHA
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo: portfolioRepo,
    ref: `heads/${branch}`
  });
  const baseSha = refData.object.sha;

  // 2. Create new branch
  await octokit.git.createRef({
    owner,
    repo: portfolioRepo,
    ref: `refs/heads/${newBranch}`,
    sha: baseSha
  });

  // 3. Create file with AI content
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: portfolioRepo,
    path,
    message: "Auto-generated portfolio update",
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: newBranch
  });

  // 4. Create PR
  const { data: pr } = await octokit.pulls.create({
    owner,
    repo: portfolioRepo,
    title: "🤖 Auto-generated portfolio update",
    head: newBranch,
    base: branch,
    body: "This PR adds a new portfolio update generated from recent commits."
  });

  return pr.html_url;
}
