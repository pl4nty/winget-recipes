import { defineShard } from 'anthelion';

type Update = { productVersion: string; url: string };

export default defineShard(async () => {
	const [user, machine] = await Promise.all(
		['user', 'system'].map((scope) => fetch(`https://www.codebuddy.ai/v2/update?platform=ide-win32-x64-${scope}`).then((response) => response.json() as Promise<Update>)),
	);
	if (user!.productVersion !== machine!.productVersion) throw new Error('Inconsistent versions detected');
	return { version: user!.productVersion, urls: () => [user!.url, machine!.url] };
});
