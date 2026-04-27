import { lstatSync } from 'node:fs'
import { openInBrowser } from './utils/openInBrowser.js'
import { is, validate, isInt } from './utils/validate.js'

/** @type {{
 * 	[K in keyof Config]-?: [
 * 		defaultVal: Config[K],
 * 		validator: (val: unknown) => err:string
 * 	]
 * }} */
const schema = {
	testsDir: ['', p => !lstatSync(p).isDirectory()],
	host: ['127.0.0.1', is(String)],
	port: [0, isInt(0, 2 ** 16 - 1)], // 0 means auto-assigned
	onReady: [await openInBrowser, is(Function)],
	hotReload: [true, is(Boolean)], // TODO false
}


const defaults = {}
const validators = {}
for (const [k, [defaultVal, validator]] of Object.entries(schema)) {
	defaults[k] = defaultVal
	validators[k] = validator
}

/** @type Config */
export const config = Object.seal(defaults)

/** @type {Record<keyof Config, (val: unknown) => val is Config[keyof Config]>} */
export const ConfigValidator = Object.freeze(validators)


/** @param {Partial<Config>} opts */
export function setup(opts) {
	Object.assign(config, opts)
	validate(config, ConfigValidator)
}

