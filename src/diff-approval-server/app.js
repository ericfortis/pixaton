#!/usr/bin/env node

import { join } from 'node:path'
import { createServer } from 'node:http'

import { ImageExt } from '../FileExtensions.js'
import { openInBrowser } from './openInBrowser.js'
import { sendJSON, sendFile, sendNotFound } from './http.js'
import { API, listDiffs, approve, config, resolveImg } from './Api.js'




export function diffServer(testsDir, port = 0, open = openInBrowser) {
	config.testsDir = testsDir

	if (!listDiffs().length) {
		console.log('Diff Server: No Diffs')
		return
	}

	createServer(onRequest).listen(port, function (error) {
		if (error)
			console.error('Diff Server: ERROR', error)
		else {
			const address = `http://localhost:${this.address().port}`
			console.log('Diff Server Running. (Ctrl + C) to close it')
			console.log(address)
			open(address)
		}
	})
}


async function onRequest(req, response) {
	const { method, url } = req

	if (method === 'GET') {
		if (url === API.home)
			sendFile(response, join(import.meta.dirname, 'index.html'))

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

