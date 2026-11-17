import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor publishes each release by committing Latest/todolist_exe.zip with the message
// "Update todolist_exe.zip to <version>", so the file's latest commit gives the version and a pinned URL.
export default defineShard(async () => {
	const feed = await fetch(
		'https://github.com/abstractspoon/ToDoList_Downloads/commits/master/Latest/todolist_exe.zip.atom',
	).then((response) => response.text());
	const {
		captures: { commit, version },
	} = match(
		feed,
		/<entry>[\s\S]*?Commit\/(?<commit>[0-9a-f]{40})[\s\S]*?<title>\s*Update todolist_exe\.zip to (?<version>\d+(?:\.\d+)+)\s*<\/title>/i,
		'No todolist_exe.zip release commit in the feed',
	);

	return {
		version: version!,
		urls: () => [`https://github.com/abstractspoon/ToDoList_Downloads/raw/${commit}/Latest/todolist_exe.zip`],
	};
});
