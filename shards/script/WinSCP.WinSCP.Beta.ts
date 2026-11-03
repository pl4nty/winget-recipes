import { defineShard } from "anthelion";

export default defineShard(async () => {
  const feed = await fetch(
    "https://sourceforge.net/projects/winscp/rss?path=/WinSCP",
  ).then((response) => response.text());
  const base =
    /\/WinSCP\/(\d+(?:\.\d+)+) beta\/WinSCP-\1\.beta-Setup\.exe/.exec(
      feed,
    )?.[1];
  if (!base) throw new Error("No WinSCP beta found in the SourceForge feed");
  const folder = `https://sourceforge.net/projects/winscp/files/WinSCP/${base}%20beta`;

  return {
    version: `${base}.beta`,
    urls: () => [
      `${folder}/WinSCP-${base}.beta-Setup.exe/download`,
      `${folder}/WinSCP-${base}.beta.msi/download`,
    ],
    releaseNotes: {
      releaseNotesUrl: `https://winscp.net/eng/docs/history#${base}`,
    },
  };
});
