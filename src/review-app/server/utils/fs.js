import { realpath } from 'node:fs/promises'
import { lstatSync, readdirSync } from 'node:fs'
import { join, sep, posix, resolve } from 'node:path'


export const isFile = path => lstatSync(path, { throwIfNoEntry: false })?.isFile()

/** @returns {Array<string>} paths relative to `dir` */
export function listFilesRecursively(dir) {
	try {
		const files = readdirSync(dir, { recursive: true }).filter(f => isFile(join(dir, f)))
		return process.platform === 'win32'
			? files.map(f => f.replaceAll(sep, posix.sep))
			: files
	}
	catch { // e.g. ENOENT
		return []
	}
}

/** @returns {string | null} absolute path if it’s within `baseDir` */
export async function resolveIn(baseDir, file) {
	try {
		const parent = await realpath(baseDir)
		const child = resolve(join(parent, file))
		return child.startsWith(join(parent, sep))
			? child
			: null
	}
	catch (e) {
		return null
	}
}
