import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;

function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${year}_${month}_${day}_${hours}${minutes}${seconds}_${milliseconds}`;
}


async function getFileSha(path) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.data.sha;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    throw err;
  }
}

app.post("/api/save-responses", async (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ error: "No data received" });

  // Define the file path inside GitHub repo (in saved_responses folder)
  const filename = `responses_${getFormattedTimestamp()}.json`;
  const filePath = `saved_responses/${filename}`;

  const contentEncoded = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  try {
    const sha = await getFileSha(filePath);
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

    const payload = {
      message: sha ? `Update ${filePath}` : `Add ${filePath}`,
      content: contentEncoded,
      branch: GITHUB_BRANCH,
      committer: {
        name: "Your App",
        email: "app@example.com",
      },
    };

    if (sha) payload.sha = sha;

    await axios.put(url, payload, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.json({ success: true, path: filePath });
  } catch (err) {
    console.error("GitHub API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to save to GitHub" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
