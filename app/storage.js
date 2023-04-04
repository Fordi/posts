
const storage = require('electron-json-storage');

const wrap = (name, argc, change) => (...args) => new Promise((r, t) => {
	const a = new Array(argc).fill(undefined).map((_, i) => args[i]);
	a.push((e, d) => e ? t(e) : r(d));
	storage[name].apply(storage, a);
});

module.exports = {
	get: wrap('get', 1),
	getMany: wrap('getMany', 1),
	getAll: wrap('getAll', 0),
	set: wrap('set', 2),
	has: wrap('has', 1),
	keys: wrap('keys', 0),
	remove: wrap('remove', 1),
	clear: wrap('clear', 0),
};


