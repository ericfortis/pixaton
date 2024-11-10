import { mimeFor } from './mime.js'
import { readFileSync, existsSync } from 'node:fs'


export function sendOK(response) {
	response.end()
}

export function sendJSON(response, body) {
	response.setHeader('Content-Type', mimeFor('json'))
	response.end(JSON.stringify(body))
}

export function sendFile(response, filePath) {
	if (!existsSync(filePath))
		sendNotFound(response)
	else {
		response.setHeader('Content-Type', mimeFor(filePath))
		response.end(readFileSync(filePath))
	}
}

export function sendBadRequest(response, error) {
	response.statusCode = 400
	response.end(error)
}

export function sendNotFound(response) {
	response.statusCode = 404
	response.end()
}

export function sendInternalServerError(response, error) {
	console.error(error)
	response.statusCode = 500
	response.end()
}



export function parseJSON(req) {
	return new Promise((resolve, reject) => {
		const MAX_BODY_SIZE = 200 * 1024
		const expectedLength = req.headers['content-length'] | 0
		let lengthSoFar = 0
		const body = []
		req.on('data', onData)
		req.on('end', onEnd)
		req.on('error', onEnd)

		function onData(chunk) {
			lengthSoFar += chunk.length
			if (lengthSoFar > MAX_BODY_SIZE)
				onEnd()
			else
				body.push(chunk)
		}

		function onEnd() {
			req.removeListener('data', onData)
			req.removeListener('end', onEnd)
			req.removeListener('error', onEnd)
			if (lengthSoFar !== expectedLength)
				reject(new JsonBodyParserError())
			else
				try {
					resolve(JSON.parse(Buffer.concat(body).toString()))
				}
				catch (_) {
					reject(new JsonBodyParserError())
				}
		}
	})
}

export class JsonBodyParserError extends Error {}
