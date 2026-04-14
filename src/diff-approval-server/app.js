#!/usr/bin/env node

import { join } from 'node:path'
import { createServer } from 'node:http'

import { config } from './config.js'
import { ImageExt } from '../FileExtensions.js'
import { API, listDiffs, approve, resolveImg } from './Api.js'
import { sendJSON, sendFile, sendNotFound } from './http.js'


export function PixatonReviewServer(options) {
	return new Promise((resolve, reject) => {
		Object.assign(config, options)

		if (!listDiffs().length) {
			console.log('Diff Server: No Diffs')
			resolve()
			return
		}

		const server = createServer(onRequest)
		server.on('error', reject)
		server.listen(config.port, config.host, () => {
			const url = `http://${server.address().address}:${server.address().port}`
			console.info('Diff Server Running. (Ctrl + C) to close it')
			console.info(url)
			open(url)
			resolve(server)
		})
	})
}


async function onRequest(req, response) {
	const { method, url } = req

	if (method === 'GET') {
		if (url === API.home)
			sendFile(response, join(import.meta.dirname, 'client', 'index.html'))

		else if (url === API.diffs)
			sendJSON(response, listDiffs())

		else if (url.endsWith(ImageExt.png))
			sendFile(response, resolveImg(url))

		else
			sendNotFound(response)
	}

	else if (method === 'PATCH' && url === API.approve)
		await approve(req, response)

	else
		sendNotFound(response)
}

