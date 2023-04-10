
const { app } = require('electron');
const { join } = require('path');
const { readFile, writeFile, stat, unlink, mkdir } = require('fs/promises');

const root = join(app.getPath('userData'), 'storage');

const hasDir = mkdir(root, { recursive: true });

const get = async (key) => {
	try {
		await hasDir;
		return JSON.parse(await readFile(join(root, `${key}.json`), 'utf-8'));
	} catch (e) {
		return undefined;
	}
};

const set = async (key, value) => {
	await hasDir;
	await writeFile(join(root, `${key}.json`), JSON.stringify(value, null, 2), 'utf-8');
};

const has = async (key) => {
	try {
		await hasDir;
		await stat(join(root, `${key}.json`));
		return true;
	} catch (e) {
		return false;
	}
};

const remove = async (key) => {
	try {
		await unlink(join(root, `${key}.json`));
	} catch (e) { /* */ }
};

const storage = { get, set, has, remove };

module.exports = storage;