
const { app } = require('electron');
const { join } = require('path');
const { readFile, writeFile, stat } = require('fs/promises');

const root = join(app.getPath('userData'), 'storage');

const get = async (key) => {
	try {
		return JSON.parse(await readFile(join(root, `${key}.json`), 'utf-8'));
	} catch (e) {
		return undefined;
	}
};

const set = async (key, value) => {
	await writeFile(join(root, `${key}.json`), JSON.stringify(value, null, 2), 'utf-8');
};

const has = async (key) => {
	try {
		await stat(join(root, `${key}.json`));
		return true;
	} catch (e) {
		return false;
	}
};

module.exports = { get, set, has };