import { join } from 'node:path'
import { after } from 'node:test'
import { launch } from 'puppeteer'
import { Mockaton } from 'mockaton'
import {
	removeDiffsAndCandidates,
	testPixels as _testPixels,
	diffServer
} from '../index.js' // XXX Change it to 'pixaton' in your project

const mockaton = await Mockaton({ port: 0 })
export const DEMO_APP_ADDR = `http://localhost:${mockaton.address().port}`

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
