import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const body = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><ASDGetSoftwareList xmlns="MKDBWCF.ASDAuthService"><email /><country xmlns:a="http://schemas.datacontract.org/2004/07/MKDBWCF.ExtensibleDataContract" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><a:Code>US</a:Code><a:DefaultLanguage i:nil="true" /><a:Description i:nil="true" /></country></ASDGetSoftwareList></s:Body></s:Envelope>`;

export default defineShard(async () => {
	const xml = await fetch('https://applications.it.abb.com/MKDBWCF/ASDAuthService.svc', {
		method: 'POST',
		headers: { SOAPAction: 'MKDBWCF.ASDAuthService/IASDAuthService/ASDGetSoftwareList', 'Content-Type': 'text/xml; charset=utf-8' },
		body,
	}).then((response) => response.text());
	const entry = xml.split(/<(?:\w+:)?ASDSoftwareEx>/).find((part) => /<(?:\w+:)?Title>e-Design</.test(part));
	if (!entry) throw new Error('No e-Design entry found');
	const full = match(entry, /<(?:\w+:)?FullVersion>([\s\S]*?)<\/(?:\w+:)?FullVersion>/, 'No e-Design version found').groups[0];
	const [url] = match(full, /<(?:\w+:)?InstallerUrl>([^<]+)</, 'No e-Design installer found').groups;
	const [version] = match(full, /<(?:\w+:)?Release>([^<]+)</, 'No e-Design release found').groups;
	return { version, urls: () => [url] };
});
