import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// EDB lists unsupported series only on its binaries page; its Windows link redirects to a file named with the full EDB build version.
export default defineShard(async () => {
	const page = await fetch('https://www.enterprisedb.com/download-postgresql-binaries').then((response) => response.text());
	const {
		groups: [fileId],
	} = match(
		page,
		/>13\.\d+<[\s\S]*?getfile\.jsp\?fileid=\d+"[\s\S]*?getfile\.jsp\?fileid=(\d+)"/i,
		'No PostgreSQL 13 Windows binaries link found',
	);
	const response = await fetch(`https://sbp.enterprisedb.com/getfile.jsp?fileid=${fileId}`, { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const {
		groups: [version],
	} = match(location, /postgresql-(13\.\d+-\d+)-windows-x64-binaries\.zip$/i, `Unexpected PostgreSQL 13 binaries redirect: ${location}`);

	return {
		version,
		urls: () => [`https://get.enterprisedb.com/postgresql/postgresql-${version}-windows-x64.exe`],
		releaseNotes: { releaseNotesUrl: `https://www.postgresql.org/docs/release/${version.split('-')[0]}/` },
	};
});
