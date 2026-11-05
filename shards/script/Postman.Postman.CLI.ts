import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// The "latest" endpoint serves the zip directly; its Content-Disposition names the version.
export default defineShard(async () => {
	const response = await ky.head('https://dl-cli.pstmn.io/download/latest/win64');
	const version = match(
		response.headers.get('content-disposition'),
		/postman-cli-(\d+(?:\.\d+)+)-windows-x64\.zip/,
		'No Postman CLI version in Content-Disposition',
	).groups[0];

	return {
		version,
		urls: () => [`https://dl-cli.pstmn.io/download/version/${version}/win64`],
		releaseNotes: {
			releaseNotesUrl: `https://www.postman.com/release-notes/postman-cli/#v${version.replaceAll('.', '-')}`,
		},
	};
});
