#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { PixatonReviewServer } from './app.js'
import pkgJSON from '../../../package.json' with { type: 'json' }


process.on('unhandledRejection', error => { throw error })

let args, positionals
try {
	const result = parseArgs({
		options: {
			host: { short: 'H', type: 'string' },
			port: { short: 'p', type: 'string' },
			help: { short: 'h', type: 'boolean' },
			version: { short: 'v', type: 'boolean' }
		},
		allowPositionals: true
	})
	args = result.values
	positionals = result.positionals
}
catch (error) {
	console.error(error.message)
	process.exit(1)
}

process.on('SIGUSR2', () => process.exit(0)) // For clean exit when collecting code-coverage


if (args.version)
	console.log(pkgJSON.version)

else if (args.help)
	console.log(`
Usage: pixaton tests-dir

Options:
  -H, --host <host>    (default: 127.0.0.1)
  -p, --port <port>    (default: 0) which means auto-assigned
  -h, --help
  -v, --version
`.trim())

else {
	const opts = {}
	if (args.host) opts.host = args.host
	if (args.port) opts.port = Number.isNaN(Number(args.port)) ? args.port : Number(args.port)
	if (positionals[0]) opts.testsDir = positionals[0]

	try {
		await PixatonReviewServer(opts)
	}
	catch (err) {
		console.error(err?.message || err)
		process.exit(1)
	}
}
