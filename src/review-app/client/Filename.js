export const Filename = {
	ext: {
		png: '.png',
		diff: '.diff.png',
		gold: '.gold.png',
		candidate: '.candidate.png',
	},
	
	goldFromDiff(f) { return f.replace(/\.diff\.png$/, this.ext.gold) },
	candidateFromDiff(f) { return f.replace(/\.diff\.png$/, this.ext.candidate) },

	isPng(f) { return f.endsWith(this.ext.png) },
	isDiff(f) { return f.endsWith(this.ext.diff) },
	isCandidate(f) { return f.endsWith(this.ext.candidate) },

	basename(testName, width, height, colorScheme) {
		return `${testName}.vp${width}x${height}.${colorScheme}`
	},
	
	parse(f) {
		const m = f.match(/^(.*?)\.vp(.*?)\.(.*?)\./)
		return {
			title: m?.[1] ?? '',
			viewport: m?.[2] ?? '',
			colorScheme: m?.[3] ?? ''
		}
	},
}
