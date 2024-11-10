import { after } from 'node:test'
import { launch } from 'puppeteer'
import { removeDiffsAndCandidates, testPixels as _testPixels, diffServer } from '../index.js'

// Before running these tests, spin up the demo app.
// The demo app is a Mockaton-based app, which
// is handy setting-up the desired api response.
//   npm run start

export const DEMO_APP_ADDR = 'http://localhost:55201'
const testsDir = import.meta.dirname

removeDiffsAndCandidates(testsDir)
const browser = await launch({ headless: true })
const page = await browser.newPage()

after(() => {
	browser?.close()
	diffServer(testsDir)
})

export function testPixels(testFileName, path, selector, options = {}) {
	options.viewports ??= [{ width: 1024, height: 800 }]
	_testPixels(
		page, 
		testFileName, 
		DEMO_APP_ADDR + path, 
		selector, 
		options)
}
