import { defineShard } from "anthelion";
import { compareVersions } from "anthelion/helpers";

// Zee Drive builds live in a public Azure blob container as
// Version-<version>/ZeeDrive.exe, and only some builds also get the
// ZeeDrive.msi the package uses. List the container, take the newest version
// that has an MSI, and use that version's row of the download page's version
// history as the release notes (passed as a data: URL so the rest of the page
// is left out).
const container = "https://thinkscapestorage.blob.core.windows.net/zeedrive";
const page = "https://docs.zeedrive.com/resources/download";

export default defineShard(async () => {
  const listing = await fetch(
    `${container}?restype=container&comp=list&prefix=Version-`,
  ).then((response) => response.text());
  const versions = [
    ...listing.matchAll(
      /<Name>Version-(\d+(?:\.\d+)+)\/ZeeDrive\.msi<\/Name>/g,
    ),
  ].map((entry) => entry[1]);
  const [version] = versions.sort((a, b) => compareVersions(b, a));
  if (!version) throw new Error("No ZeeDrive.msi found in the blob container");

  const html = await fetch(page).then((response) => response.text());
  const row = html
    .split('role="row"')
    .find(
      (chunk) =>
        chunk.includes(`/Version-${version}/ZeeDrive.exe"`) &&
        chunk.includes('role="cell"'),
    );
  const notes = row
    ?.split('role="cell"')[4]
    ?.replace(/^[^>]*>/, "")
    .replace(/<div[^>]*$/, "")
    .replace(/(?:<\/div>\s*)+$/, "")
    .trim();

  return {
    version,
    urls: () => [
      {
        url: `${container}/Version-${version}/ZeeDrive.msi`,
        architecture: "x86",
      },
    ],
    releaseNotes: notes
      ? {
          source: "html",
          sourceUrl: `data:text/html,${encodeURIComponent(notes)}`,
          releaseNotesUrl: `${page}#version-history`,
          cleanup: false,
        }
      : { releaseNotesUrl: `${page}#version-history` },
  };
});
