import { defineShard } from "anthelion";
import { match } from "anthelion/helpers";

const cdn = "https://public-cdn.cloud.unity3d.com/hub/prod/cli";

// The CLI has no stable channel yet. MSIX versions put the beta number in the revision field:
// 1.0.0-beta.15 is packaged as 1.0.0.20015
export default defineShard(async () => {
  const { version: tag } = await fetch(`${cdn}/latest-beta.json`).then(
    (response) => response.json(),
  );
  const {
    groups: [base, beta],
  } = match(tag, /^(\d+\.\d+\.\d+)-beta\.(\d+)$/);

  return {
    version: `${base}.${20000 + Number(beta)}`,
    urls: () => [
      `${cdn}/${tag}/unity-windows-x64.msix`,
      `${cdn}/${tag}/unity-windows-arm64.msix`,
    ],
    releaseNotes: {
      source: "markdown",
      sourceUrl: `${cdn}/${tag}/CHANGELOG.md`,
      releaseNotesUrl: `${cdn}/${tag}/CHANGELOG.md`,
      cleanup: false,
    },
  };
});
