import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch('https://www.databricks.com/spark/odbc-drivers-archive').then((response) => response.text());
	const builds = [
		...page.matchAll(/simbaspark-drivers\/odbc\/(\d+(?:\.\d+)+)\/SimbaSparkODBC-(\d+(?:\.\d+)+)-Windows-64bit\.zip/g),
	].map((m) => ({ version: m[1]!, file: m[2]! }));
	const latest = builds.sort((a, b) => compareVersions(a.version, b.version)).at(-1);
	if (!latest) throw new Error('No Simba Spark ODBC driver found on the archive page');
	const base = `https://databricks-bi-artifacts.s3.us-east-2.amazonaws.com/simbaspark-drivers/odbc/${latest.version}`;

	return {
		version: latest.version,
		urls: () => [
			{ url: `${base}/SimbaSparkODBC-${latest.file}-Windows-32bit.zip`, architecture: 'x86' },
			{ url: `${base}/SimbaSparkODBC-${latest.file}-Windows-64bit.zip`, architecture: 'x64' },
		],
		releaseNotes: { releaseNotesUrl: `${base}/docs/release-notes.txt` },
	};
});
