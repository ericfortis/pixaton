import { join } from 'node:path'
import { after } from 'node:test'
import { launch } from 'puppeteer'
import {
	removeDiffsAndCandidates,
	testPixels as _testPixels, 
	diffServer
} from '../index.js' // XXX Change it to 'pixaton' in your project

// Before running these tests, spin up the demo app.
//   npm install mockaton
//   npm run demo

export const DEMO_APP_ADDR = 'http://localhost:55201'
const testsDir = join(import.meta.dirname, 'macos')

removeDiffsAndCandidates(testsDir)
const browser = await launch({ headless: 'shell' })
const page = await browser.newPage()

after(() => {
	browser?.close()
	diffServer(testsDir)
})

export function testPixels(testFileName, path, selector, options = {}) {
	options.viewports ??= [{ width: 1024, height: 800 }]
	options.outputDir ??= 'demo-tests/macos'
	_testPixels(
		page,
		testFileName,
		DEMO_APP_ADDR + path,
		selector,
		options)
}
