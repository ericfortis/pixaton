import fs from 'node:fs'
import http from 'node:http'

import { mimeFor } from './mime.js'


export class ServerResponse extends http.ServerResponse {
	ok() {
		this.end()
	}

	html(html, csp) {
		this.setHeader('Content-Type', mimeFor('.html'))
		this.setHeader('Content-Security-Policy', csp)
		this.end(html)
	}

	json(payload) {
		this.setHeader('Content-Type', mimeFor('.json'))
		this.end(JSON.stringify(payload))
	}

	async file(file) {
		this.setHeader('Content-Type', mimeFor(file))
		try {
			this.end(await fs.promises.readFile(file))
		}
		catch (err) {
			if (err?.code === 'ENOENT')
				this.notFound()
			else
				this.internalServerError(err)
		}
	}
	

	badRequest() {
		this.statusCode = 400
		this.end()
	}
	forbidden(msg) {
		this.statusCode = 403
		this.end(msg)
	}
	notFound() {
		this.statusCode = 404
		this.end()
	}
	uriTooLong() {
		this.statusCode = 414
		this.end()
	}
	unprocessable(error) {
		this.statusCode = 422
		this.end(error)
	}

	
	internalServerError() {
		this.statusCode = 500
		this.end()
	}
}
