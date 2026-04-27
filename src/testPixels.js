import { parse, join } from 'node:path'
import { describe, it, before, after } from 'node:test'
import { writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

import { diffPNG } from './diffPNG.js'
import { Filename } from './review-app/client/Filename.js'


export function testPixels(page, testFilename, url, selector, {
		skip,
		beforeSuite = page => {},
		afterSuite = page => {},
		viewports = [{ width: 800, height: 600 }],
		colorSchemes = ['light'],
		gotoOptions,
		setup = _page => {},
		screenshotDelayMs = 0,
		screenshotOptions = {},
		diffOptions,
		outputDir = '.'
	} = {}
) {
	const filenames = Filenames(testFilename, outputDir)

	describe(filenames.testName, { skip }, async () => {
		for (const cs of colorSchemes)
			for (const vp of viewports) {
				const width = vp.width || page.viewport().width
				const height = vp.height || page.viewport().height

				await it(`📷 ${width}x${height}`, async () => {
					before(() => beforeSuite(page))
					after(() => afterSuite(page))
					await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: cs }])
					await page.setViewport(vp)
					await page.goto(url, gotoOptions)

					await setup(page)
					const elem = await page.waitForSelector(selector)
					await sleep(screenshotDelayMs)

					const { gold, candidate, diff } = filenames.images(cs, width, height)
					if (!existsSync(gold)) // It’s a new test
						await elem.screenshot({
							...screenshotOptions,
							type: 'png',
							path: gold
						})
					else {
						const candidateImg = await elem.screenshot({
							...screenshotOptions,
							type: 'png',
							path: undefined
						})
						const diffedImg = diffPNG(
							await readFile(gold), 
							Buffer.from(candidateImg), 
							diffOptions
						)
						if (diffedImg) {
							await writeFile(diff, diffedImg)
							await writeFile(candidate, candidateImg)
							throw 'Screenshot does not match'
						}
					}
				})
			}
	})
}

function Filenames(testFileName, outputDir) {
	const testName = parse(testFileName).name.replace(/\.test$/, '')
	return {
		testName,
		images(colorScheme, width, height) {
			const absPrefix = join(outputDir, Filename.basename(testName, width, height, colorScheme))
			return {
				diff: absPrefix + Filename.ext.diff,
				gold: absPrefix + Filename.ext.gold,
				candidate: absPrefix + Filename.ext.candidate
			}
		}
	}
}

function sleep(ms) {
	return ms && new Promise(resolve => setTimeout(resolve, ms))
}

