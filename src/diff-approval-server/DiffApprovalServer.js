#!/usr/bin/env node

import { exec } from 'node:child_process'
import { resolve, join } from 'node:path'
import { createServer } from 'node:http'
import {
	existsSync as exists,
	unlinkSync as remove,
	readdirSync as readDir,
	renameSync as rename, lstatSync
} from 'node:fs'

import { ImageExt } from '../FileExtensions.js'
import { openInBrowser } from './openInBrowser.js'
import {
	parseJSON,
	sendJSON,
	sendOK,
	sendFile,
	sendNotFound,
	sendBadRequest,
	sendInternalServerError
} from './http.js'


const API = { // @KeepSync with DiffApprovalServer.html
	home: '/',
	diffs: '/diffs',
	approve: '/approve'
}

export function diffServer(
	testsDir,
	port = 0,
	open = openInBrowser
) {
	const listDiffs = () => readDir(testsDir, { recursive: true })
		.filter(f => f.endsWith(ImageExt.diff) && lstatSync(join(testsDir, f)))
		.sort()

	if (!listDiffs().length) {
		console.log('Diff Server: No Diffs')
		return
	}

	const resolveImg = url => join(testsDir, decodeURIComponent(url))

	createServer(async (request, response) => {
		const { method, url } = request

		if (method === 'GET') {
			if (url === API.home)
				sendFile(response, join(import.meta.dirname, 'DiffApprovalServer.html'))

			else if (url === API.diffs)
				sendJSON(response, listDiffs())

			else if (url.endsWith(ImageExt.png))
				sendFile(response, resolveImg(url))
			
			else
				sendNotFound(response)
		}

		else if (method === 'PATCH' && url === API.approve) {
			try {
				const diff = resolveImg(await parseJSON(request))
				if (!exists(diff))
					sendBadRequest(response, 'MISSING_DIFF')

				else if (!resolve(diff).startsWith(testsDir))
					sendBadRequest(response, 'DIRECTORY_ESCAPE_ATTEMPT')

				else { // Promote candidate
					const gold = diff.replace(ImageExt.diff, ImageExt.gold)
					const candidate = diff.replace(ImageExt.diff, ImageExt.candidate)
					remove(diff)
					remove(gold)
					rename(candidate, gold)
					sendOK(response)
				}
			}
			catch (error) {
				sendInternalServerError(response, error)
			}
		}

		else
			sendNotFound(response)
	})
		.listen(port, function (error) {
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
