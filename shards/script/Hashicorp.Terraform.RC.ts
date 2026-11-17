import { defineShard } from 'anthelion';

// HashiCorp's release API lists every Terraform build newest first; this Id tracks the -rcN prereleases only.
export default defineShard(async () => {
	const response = await fetch('https://api.releases.hashicorp.com/v1/releases/terraform?limit=20');
	if (!response.ok) throw new Error(`HashiCorp releases API returned HTTP ${response.status}`);
	const releases = (await response.json()) as { version: string; is_prerelease: boolean; url_changelog?: string }[];
	const release = releases.find((r) => r.is_prerelease && /^\d+\.\d+\.\d+-rc\d+$/.test(r.version));
	if (!release) throw new Error('No Terraform rc release in the latest 20 releases');
	const { version } = release;

	return {
		version,
		urls: () => [
			`https://releases.hashicorp.com/terraform/${version}/terraform_${version}_windows_386.zip`,
			`https://releases.hashicorp.com/terraform/${version}/terraform_${version}_windows_amd64.zip`,
		],
		releaseNotes: release.url_changelog ? { releaseNotesUrl: release.url_changelog } : undefined,
	};
});
