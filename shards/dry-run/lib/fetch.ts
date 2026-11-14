// Some vendor sites reject non-browser user agents.
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

export const text = (url: string | URL, init?: RequestInit) => fetch(url, { ...init, headers: { 'user-agent': userAgent, ...init?.headers } }).then((response) => response.text());

// Follows redirects and returns the final URL without reading the body.
export async function resolve(url: string | URL, init?: RequestInit) {
	const response = await fetch(url, init);
	await response.body?.cancel();
	return response.url;
}

// Returns the first absolute URL in a page whose text matches the pattern.
export async function link(page: string, pattern: RegExp, init?: RequestInit) {
	const html = await text(page, init);
	const href = html.match(new RegExp(`(?:href|data-href|src)\\s*=\\s*["']([^"']*${pattern.source}[^"']*)["']`, pattern.flags))?.[1];
	if (!href) throw new Error(`No link matching ${pattern} on ${page}`);
	return new URL(href.replaceAll('&amp;', '&'), page).href;
}
