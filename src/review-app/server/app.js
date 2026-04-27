#!/usr/bin/env node

import { join } from 'node:path'
import { createServer } from 'node:http'

import { config } from './config.js'
import { resolveIn } from './utils/fs.js'
import { Filename } from '../client/Filename.js'
import { ServerResponse } from './utils/HttpServerResponse.js'
import { listDiffs, apiPatchReqs, apiGetReqs, CLIENT_DIR } from './Api.js'
import { IncomingMessage, hasControlChars, BodyReaderError } from './utils/HttpIncomingMessage.js'

import pkgJSON from '../../../package.json' with { type: 'json' }
import { watchDevSPA } from './utils/WatcherDevClient.js'


const rel = f => join(import.meta.dirname, f)

export function PixatonReviewServer(options) {
	return new Promise((resolve, reject) => {
		Object.assign(config, options)

		if (!listDiffs().length) {
			console.log('No Diffs Found')
			resolve()
			return
		}

		watchDevSPA(CLIENT_DIR)

		const server = createServer({ IncomingMessage, ServerResponse }, onRequest)
		server.on('error', reject)
		server.listen(config.port, config.host, () => {
			const url = `http://${server.address().address}:${server.address().port}`
			console.info('Diff Server Running. (Ctrl + C) to close it')
			console.info(url)
			config.onReady(url)
			resolve(server)
		})
	})
}


async function onRequest(req, response) {
	response.setHeader('Server', `Pixaton ${pkgJSON.version}`)
	response.on('error', console.error)

	const url = req.url || ''

	if (url.length > 2048) {
		response.uriTooLong()
		return
	}
	if (hasControlChars(url)) {
		response.badRequest()
		return
	}

	try {
		const { method } = req
		const { pathname } = new URL(url, 'http://_')

		if (method === 'PATCH' && apiPatchReqs.has(pathname))
			await apiPatchReqs.get(pathname)(req, response)

		else if (method === 'GET' && apiGetReqs.has(pathname))
			apiGetReqs.get(pathname)(req, response)

		else if (method === 'GET' && Filename.isPng(url)) {
			const f = await resolveIn(config.testsDir, url)
			if (!f)
				response.forbidden('Sandbox escape attempt')
			else
				await response.file(f)
		}

		else
			response.notFound()
	}
	catch (error) {
		if (error instanceof BodyReaderError)
			response.unprocessable(`${error.name}: ${error.message}`)
		else {
			console.error(500, req.url, error?.message || error, error?.stack || '')
			response.internalServerError(error)
		}
	}
}

