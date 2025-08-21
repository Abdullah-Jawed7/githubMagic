import express from "express";
import { verifySignature } from "./verifySignature.js";
import { extractCommitData } from "./extractCommit.js";
import { generatePortfolioUpdate } from "./generateContent.js";
import { createPortfolioPR } from "./githubPR.js";
import { github_webhook_secret } from "./env.js";

const app = express();

app.post(
  "/github-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const secret = github_webhook_secret || "";
    const sigHeader = req.headers["x-hub-signature-256"] || "";
    const event = req.headers["x-github-event"] || "";

    if (event !== "push") return res.status(204).end();
    if (!verifySignature(secret, sigHeader, req.body)) {
      return res.status(403).send("Invalid signature");
    }

    const payload = JSON.parse(req.body.toString("utf8"));
    const commitData = extractCommitData(payload);

    try {
      const content = await generatePortfolioUpdate(commitData);
      const prUrl = await createPortfolioPR({
        content,
        repo: commitData.repo,
        branch: "main" // portfolio site main branch
      });

      console.log(`✅ PR created: ${prUrl}`);
      res.status(200).send("PR created");
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send("Processing error");
    }
  }
);

app.listen(3000, () => console.log("Listening on :3000"));
