import { describe, test } from 'node:test'
import { Filename } from './Filename.js'
import { equal } from 'node:assert/strict'


describe('Filename', () => {
	const diff = Filename.basename('test-name', 1280, 720, 'light') + Filename.ext.diff
	test('parse', () => {
		const { title, viewport, colorScheme } = Filename.parse(diff)
		equal(title, 'test-name')
		equal(viewport, '1280x720')
		equal(colorScheme, 'light')
	})

	test('goldFromDiff', () =>
		equal(Filename.goldFromDiff(diff), 'test-name.vp1280x720.light.gold.png'))

	test('candidateFromDiff', () =>
		equal(Filename.candidateFromDiff(diff), 'test-name.vp1280x720.light.candidate.png'))
	
	test('isPng', () => equal(Filename.isPng(diff), true))
	test('isDiff', () => equal(Filename.isDiff(diff), true))
	test('isCandidate', () => equal(Filename.isCandidate(diff), false))
})
