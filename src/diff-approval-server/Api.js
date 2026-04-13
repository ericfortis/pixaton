import { resolve, join } from 'node:path'
import { readdirSync, lstatSync, existsSync, renameSync, unlinkSync } from 'node:fs'

import { ImageExt } from '../FileExtensions.js'
import { parseJSON, sendBadRequest, sendOK, sendInternalServerError } from './http.js'


export const config = {
	testsDir: ''
}

export const API = { // @KeepSync with index.html
	home: '/',
	diffs: '/diffs',
	approve: '/approve'
}

export const resolveImg = url => join(config.testsDir, decodeURIComponent(url))

export const listDiffs = () => readdirSync(config.testsDir, { recursive: true })
	.filter(f => f.endsWith(ImageExt.diff) && lstatSync(join(config.testsDir, f)))
	.sort()


export async function approve(req, response) {
	try {
		const diff = resolveImg(await parseJSON(req))
		if (!existsSync(diff))
			sendBadRequest(response, 'MISSING_DIFF')

		else if (!resolve(diff).startsWith(config.testsDir))
			sendBadRequest(response, 'DIRECTORY_ESCAPE_ATTEMPT')

		else { // Promote candidate
			const gold = diff.replace(ImageExt.diff, ImageExt.gold)
			const candidate = diff.replace(ImageExt.diff, ImageExt.candidate)
			unlinkSync(diff)
			unlinkSync(gold)
			renameSync(candidate, gold)
			sendOK(response)
		}
	}
	catch (error) {
		sendInternalServerError(response, error)
	}
}
