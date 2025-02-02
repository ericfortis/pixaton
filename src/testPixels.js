import { parse, join } from 'node:path'
import { describe, it, before, after } from 'node:test'
import {
	existsSync as exists,
	readFileSync as read,
	writeFileSync as write
} from 'node:fs'

import { diffPNG } from './diffPNG.js'
import { ImageExt } from './FileExtensions.js'


export function testPixels(page, testFilename, url, selector, {
		skip,
		beforeSuite = () => {},
		afterSuite = () => {},
		viewports = [{ width: 800, height: 600 }],
		colorSchemes = ['light'],
		gotoOptions,
		setup = _page => {},
		screenshotDelayMs = 0,
		screenshotOptions = {},
		diffOptions
	} = {}
) {
	const filenames = Filenames(testFilename)

	describe(filenames.basename, { skip }, async () => {
		for (const cs of colorSchemes)
			for (const vp of viewports) {
				const width = vp.width || page.viewport().width
				const height = vp.height || page.viewport().height

				await it(`📷 ${width}x${height}`, async () => {
					await before(beforeSuite)
					await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: cs }])
					await page.setViewport(vp)
					await page.goto(url, gotoOptions)

					await setup(page)
					const elem = await page.waitForSelector(selector)
					await sleep(screenshotDelayMs)

					const { gold, candidate, diff } = filenames.images(cs, width, height)
					if (!exists(gold)) // It’s a new test
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
						const diffedImg = diffPNG(read(gold), Buffer.from(candidateImg), diffOptions)
						if (diffedImg) {
							write(diff, diffedImg)
							write(candidate, candidateImg)
							throw 'Screenshot does not match'
						}
					}
					await after(afterSuite)
				})
			}
	})
}

function Filenames(testFileName) {
	const { dir, name } = parse(testFileName)
	const basename = name.replace(/\.test$/, '')
	return {
		basename,
		images(colorScheme, width, height) {
			const absPrefix = join(dir, `${basename}.vp${width}x${height}.${colorScheme}`)
			return {
				diff: absPrefix + ImageExt.diff,
				gold: absPrefix + ImageExt.gold,
				candidate: absPrefix + ImageExt.candidate
			}
		}
	}
}

function sleep(ms) {
	return ms && new Promise(resolve => setTimeout(resolve, ms))
}

