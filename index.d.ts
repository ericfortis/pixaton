import { Page, Viewport, GoToOptions, ScreenshotOptions } from 'puppeteer'


export function diffServer(
	testsDir: string,
	port?: number,
	open?: (address: string) => void
): void

export type RGB = [number, number, number] // 0-255

export interface PixelMatchDiffOptions {
	threshold?: number // matching threshold (0 to 1); smaller is more sensitive
	includeAA?: boolean // whether to skip antialiasing detection
	alpha?: number // opacity of original image in diff output
	aaColor?: RGB // color of anti-aliased pixels in diff output 
	diffColor?: RGB // color of different pixels in diff output
	diffColorAlt?: RGB | null // whether to detect dark on light differences between img1 and img2 and set an alternative color to differentiate between the two
	diffMask?: boolean // draw the diff over a transparent background (a mask)
}

export function testPixels(
	page: Page,
	testFilename: string,
	url: string,
	selector: string,
	options?: {
		skip?: boolean
		beforeSuite?: () => void
		afterSuite?: () => void
		viewports?: Viewport[]
		colorSchemes?: Array<'light' | 'dark'>
		gotoOptions?: GoToOptions
		setup?: (page: Page) => void
		screenshotDelayMs?: number
		screenshotOptions?: ScreenshotOptions
		diffOptions?: PixelMatchDiffOptions
	}): void


export function removeDiffsAndCandidates(testDir: string, recursive?: boolean): void

export function blockExternalURLs(page: Page, origin: string): Promise<void>

export function speedUpAnimations(page: Page, playbackRate: number): Promise<void>
