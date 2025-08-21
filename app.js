// webhook.js (JavaScript)
import express from "express";
import crypto from "crypto";

const app = express();

// Only this route needs raw body because we must compute HMAC of raw bytes
app.post(
  "/webhooks/github",
  express.raw({ type: "application/json" }), // gives us raw Buffer in req.body
  async (req, res) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "";
    const sigHeader = req.headers["x-hub-signature-256"] || "";
    const event = req.headers["x-github-event"] || "";
    const deliveryId = req.headers["x-github-delivery"] || "";

    // 1) Quick checks
    if (!sigHeader) {
      console.warn("No signature header (are you using a secret?)");
      return res.status(400).send("No signature");
    }
    if (event !== "push") {
      // we only handle push for now
      return res.status(204).end(); // nothing to do
    }

    // 2) Verify signature (sha256)
    try {
      const body = req.body; // raw Buffer
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(body);
      const digest = `sha256=${hmac.digest("hex")}`;

      // timing-safe compare
      const a = Buffer.from(digest, "utf8");
      const b = Buffer.from(sigHeader, "utf8");
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        console.warn("Invalid signature");
        return res.status(403).send("Invalid signature");
      }
    } catch (err) {
      console.error("Signature verification error:", err);
      return res.status(500).send("Verification error");
    }

    // 3) Parse JSON safely (we already have raw body)
    const payload = JSON.parse(req.body.toString("utf8"));

    // 4) ACK fast and enqueue/process later
    // Example minimal: insert into DB or push to a queue
    // db.collection('pending_updates').insertOne({ deliveryId, payload, status: 'pending' });

    console.log("Received push for repo:", payload.repository?.full_name, "delivery:", deliveryId);

    res.status(200).send("Received"); // quick ACK
  }
);

app.listen(3000, () => console.log("Listening on :3000"));
