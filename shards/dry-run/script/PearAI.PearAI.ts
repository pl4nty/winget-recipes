import { defineShard } from 'anthelion';

export default defineShard(() => ({ version: { source: 'display' }, urls: () => ['https://pearai-app.nyc3.digitaloceanspaces.com/PearAI-latest/windows-x64/PearAISetup.exe'] }));
