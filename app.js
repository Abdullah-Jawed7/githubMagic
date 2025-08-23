// webhook.js
import express from "express";
import crypto from "crypto";
import { analyzeCommit } from "./pipeline/agents/commitAnalyzer.js";
import { editPortfolio } from "./pipeline/agents/portfolioEditor.js";
import { createPR, getFileContent } from "./pipeline/agents/prCreator.js";
import { github_webhook_secret } from "./env.js";

const app = express();

app.post(
  "/github-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const secret = github_webhook_secret || "";
    const sigHeader = req.headers["x-hub-signature-256"] || "";
    const event = req.headers["x-github-event"] || "";

    if (!sigHeader) return res.status(400).send("No signature");
    if (event !== "push") return res.status(204).end();

    const body = req.body;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(body);
    const digest = `sha256=${hmac.digest("hex")}`;
    if (digest !== sigHeader) return res.status(403).send("Bad signature");

    const payload = JSON.parse(body.toString("utf8"));
    const repoFull = payload?.repository?.full_name;
    const commit = payload?.head_commit;
    const baseBranch = payload?.repository?.default_branch;

    // Step 1: Analyze commit
    const update = await analyzeCommit(commit.message, commit.diff || "");

    // Step 2: Pick file path
    let filePath = "";
    if (update.type === "project update") filePath = "src/Components/Projects.jsx";
    if (update.type === "skill update") filePath = "src/Components/Skill.jsx";
    if (update.type === "education update") filePath = "src/Components/Edu.jsx";
    if (update.type === "bio update") filePath = "src/Components/About.jsx";

    // Step 3: Load current file content from Github
    const fileContent = await getFileContent(repoFull, baseBranch, filePath);

    // Step 4: Let AI edit
    const newContent = await editPortfolio(update, fileContent, filePath);

    // Step 5: Create PR
    const prUrl = await createPR(
      update,
      repoFull,
      `auto/update-${Date.now()}`,
      filePath,
      newContent
    );

    console.log("PR created:", prUrl);

    res.status(200).send("Processed");
  }
);

app.listen(3000, () => console.log("Listening on :3000"));
