import { defineShard } from "anthelion";
import { compareVersions } from "anthelion/helpers";

const msi = (version: string) =>
  `https://packages.timeware.com/biostar-agent/timeware-biostar-agent-${version}.msi`;

// timeware publishes no version list or download page, so start from the latest
// winget-pkgs version and check only the next patch, minor and major MSI (3 HEAD requests)
export default defineShard(async () => {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN)
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const entries: { name: string; type: string }[] = await fetch(
    "https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/t/timeware/BiostarAgent",
    { headers },
  ).then((response) => {
    if (!response.ok)
      throw new Error(`winget-pkgs listing failed: ${response.status}`);
    return response.json();
  });
  const current = entries
    .filter(
      (entry) => entry.type === "dir" && /^\d+(?:\.\d+)*$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort(compareVersions)
    .at(-1);
  if (!current) throw new Error("No published version found");

  const [major = 0, minor = 0, patch = 0] = current.split(".").map(Number);
  const candidates = [
    `${major}.${minor}.${patch + 1}`,
    `${major}.${minor + 1}.0`,
    `${major + 1}.0.0`,
  ];
  let version = current;
  for (const candidate of candidates) {
    if ((await fetch(msi(candidate), { method: "HEAD" })).ok) {
      version = candidate;
      break;
    }
  }

  return {
    version,
    urls: () => [msi(version)],
  };
});
