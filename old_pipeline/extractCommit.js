export function extractCommitData(payload) {
  const repo = payload.repository?.full_name;
  const branch = payload.ref?.split("/").pop();
  const commits = payload.commits || [];

  return {
    repo,
    branch,
    commits: commits.map(c => ({
      id: c.id,
      message: c.message,
      author: c.author.name,
      timestamp: c.timestamp,
      url: c.url
    }))
  };
}
