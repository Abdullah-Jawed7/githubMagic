// agents/prCreator.js
import { Octokit } from "@octokit/rest";
import { github_token } from "../../env.js";

const octokit = new Octokit({ auth: github_token });
export async function createPR(update, repo, branchName, filePath, newContent) {

  const [owner, repoName] = repo.split("/");

  // 1. Get default branch (usually "main")
  const { data: repoData } = await octokit.repos.get({ owner, repo: repoName });
  const baseBranch = repoData.default_branch;

  // 2. Get latest commit SHA
  const { data: refData } = await octokit.git.getRef({
    owner, repo: repoName, ref: `heads/${baseBranch}`
  });
  const latestSha = refData.object.sha;

  // 3. Create new branch
  await octokit.git.createRef({
    owner, repo: repoName,
    ref: `refs/heads/${branchName}`,
    sha: latestSha
  });

  // 4. Get file SHA
  let fileSha = null;
  try {
    const { data: fileData } = await octokit.repos.getContent({
      owner, repo: repoName, path: filePath, ref: baseBranch
    });
    fileSha = fileData.sha;
  } catch (err) {
    console.log("New file, no SHA.");
  }

  // 5. Update file on new branch
  await octokit.repos.createOrUpdateFileContents({
    owner, repo: repoName,
    path: filePath,
    message: `Auto-update: ${update.title}`,
    content: Buffer.from(newContent).toString("base64"),
    branch: branchName,
    sha: fileSha || undefined
  });

  // 6. Create PR
  const pr = await octokit.pulls.create({
    owner, repo: repoName,
    head: branchName,
    base: baseBranch,
    title: `Auto-update: ${update.title}`,
    body: `This PR adds updates based on commit:\n\n${update.description}`
  });

  return pr.data.html_url;
}


export async function getFileContent(repoFull, branch, filePath) {
  const [owner, repo] = repoFull.split("/");
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: branch,
  });

  // file content is base64 encoded
  return Buffer.from(data.content, "base64").toString("utf8");
}

