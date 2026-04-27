import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { mimeFor } from './mime.js'


test('mimeFor', () => {
	[
		'file.html',
		'file.HTmL'
	].map(input =>
		equal(mimeFor(input), 'text/html'))
})
