import { liberica } from '../../shards-lib/BellSoft';

// Upstream JDK versions are the MSI ProductVersion (21.0.13.10005).
export default liberica(21, 'jdk', { display: true, releaseNotes: true });
