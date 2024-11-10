import { join } from 'node:path'
import { readdirSync, lstatSync, unlinkSync } from 'node:fs'
import { reAllDiffsAndCandidates } from './FileExtensions.js'


export function removeDiffsAndCandidates(testsDir, recursive = true) {
	for (const png of readdirSync(testsDir, { recursive })) {
		const f = join(testsDir, png)
		if (reAllDiffsAndCandidates.test(png) && lstatSync(f).isFile())
			unlinkSync(f)
	}
}

export async function speedUpAnimations(page, playbackRate = 10) {
	const client = await page.target().createCDPSession() // Chrome DevTools Protocol
	await client.send('Animation.enable')
	await client.send('Animation.setPlaybackRate', { playbackRate })
}

export async function blockExternalURLs(page, origin) {
	await page.setRequestInterception(true)
	page.on('request', function blockExternalUrls(req) {
		if (req.url().startsWith(origin) || req.url().startsWith('data:'))
			req.continue()
		else
			req.abort()
	})
}
