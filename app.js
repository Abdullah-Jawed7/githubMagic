// server.js
import express from "express";
import crypto from "crypto";
// import { enqueueJob } from "./worker.js"; // any queue; or call directly

const app = express();
// IMPORTANT: to verify HMAC you need the *raw* body
// app.use("/webhooks/github", express.raw({ type: "*/*" }));

// function verifyGithubSig(req, secret) {
//   const sig256 = req.get("X-Hub-Signature-256") || "";
//   const their = Buffer.from(sig256.replace("sha256=", ""), "hex");
//   const hmac = crypto.createHmac("sha256", secret);
//   hmac.update(req.body);
//   const ours = Buffer.from(hmac.digest("hex"), "hex");
//   return their.length === ours.length && crypto.timingSafeEqual(their, ours);
// }

// app.post("/webhooks/github", async (req, res) => {
//   if (!verifyGithubSig(req, process.env.GITHUB_WEBHOOK_SECRET)) {
//     return res.status(403).send("Bad signature");
//   }
//   const event = req.get("X-GitHub-Event");
//   if (event !== "push") return res.status(204).end();

//   const delivery = req.get("X-GitHub-Delivery"); // idempotency key
//   const payload = JSON.parse(req.body.toString("utf8"));
//   await enqueueJob({ delivery, payload }); // or processJob({ ... })
//   res.status(200).end(); // ACK fast
// });

app.post("/github-webhook", async (req, res) => {
  const commitMsg = req.body.head_commit?.message;
  console.log(commitMsg)

//   const response = await client.beta.agents.sessions.create({
//     agent_id: summarizerAgent.id,
//     input: `Commit: ${commitMsg}`,
//   });

//   const summary = response.output[0].content[0].text;
//   console.log("Draft update:", summary);

//   // Save draft in Mongo with status = "pending"
//   await db.collection("updates").insertOne({
//     commit: commitMsg,
//     draft: summary,
//     status: "pending",
//   });

  res.status(200).json(commitMsg);
});

if (false) {
    app.listen(process.env.PORT || 3000);
}

export default app;
