import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { link } from '../lib/fetch.ts';

export default defineShard(async () => {
	const url = await link('https://digital.nhs.uk/services/care-identity-service/applications-and-services/technical-services/nhs-smartcard-connect', /NHS\.CredentialManagement\.Setup-[\d.]+\.msi/);
	const {
		groups: [version],
	} = match(url, /Setup-(\d+(?:\.\d+)+)\.msi/);
	return { version, urls: () => [url] };
});
