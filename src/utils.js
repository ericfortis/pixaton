import { join } from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
import { Filename } from './review-app/client/Filename.js'
import { isFile } from './review-app/server/utils/fs.js'


export function removeDiffsAndCandidates(testsDir, recursive = true) {
	for (const file of readdirSync(testsDir, { recursive })) {
		const f = join(testsDir, file)
		if ((Filename.isCandidate(file) || Filename.isDiff(file)) && isFile(f))
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
