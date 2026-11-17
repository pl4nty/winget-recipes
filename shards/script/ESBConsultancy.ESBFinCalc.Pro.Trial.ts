import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" of the vendor's version label.
export default defineShard(async () => {
	const page = await fetch('https://www.esbconsult.com/esbcalc/esbfincalcpro.htm').then((response) => response.text());
	const {
		captures: { version },
	} = match(page, /Pro Trial (?<version>v\d+(?:\.\d+)+)<\/strong>\s*<a href="https:\/\/www\.esbconsult\.com\/esbfincalcpro\.zip"/i, 'No ESBFinCalc Pro version found');

	return {
		version,
		urls: () => ['https://www.esbconsult.com/esbfincalcpro.zip'],
	};
});
