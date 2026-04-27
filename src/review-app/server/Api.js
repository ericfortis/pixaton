import { join } from 'node:path'
import { rename, unlink } from 'node:fs/promises'

import pkgJSON from '../../../package.json' with { type: 'json' }

import { API } from '../client/ApiConstants.js'
import { config } from './config.js'
import { Filename } from '../client/Filename.js'
import { IndexHtml, CSP } from '../client/IndexHtml.js'
import { sseClientHotReload } from './utils/WatcherDevClient.js'
import { resolveIn, listFilesRecursively, isFile } from './utils/fs.js'


export const CLIENT_DIR = join(import.meta.dirname, '../client')

export const apiGetReqs = new Map([
	[API.home, serveDashboard],
	...listFilesRecursively(CLIENT_DIR).map(f =>
		[`/${f}`, serveStatic(f)]),

	[API.diffs, getDiffs],
	[API.watchHotReload, onDevWatch],
])


export const apiPatchReqs = new Map([
	[API.approve, approve],
])


/** # GET */

function serveDashboard(_, response) {
	response.html(IndexHtml(config.hotReload, pkgJSON.version), CSP)
}

function serveStatic(f) {
	return (_, response) => { response.file(join(CLIENT_DIR, f)) }
}

function getDiffs(_, response) {
	response.json(listDiffs())
}

export function listDiffs() {
	return listFilesRecursively(config.testsDir)
		.filter(f => Filename.isDiff(f))
		.sort()
}

function onDevWatch(req, response) {
	if (config.hotReload)
		sseClientHotReload(req, response)
	else
		response.notFound()
}


/** # PATCH */

async function approve(req, response) {
	try {
		const resolveImg = url => join(config.testsDir, decodeURIComponent(url))
		const diff = resolveImg(await req.json(req))
		if (!isFile(diff))
			response.unprocessable('MISSING_DIFF')

		else if (!resolveIn(config.testsDir, diff))
			response.forbidden('DIRECTORY_ESCAPE_ATTEMPT')

		else { // Promote candidate
			const gold = Filename.goldFromDiff(diff)
			const candidate = Filename.candidateFromDiff(diff)
			await unlink(diff)
			await unlink(gold)
			await rename(candidate, gold)
			response.ok()
		}
	}
	catch (error) {
		response.internalServerError(error)
	}
}
