import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'


/**
 * Runs npm:pixelmatch, which needs images of equal dimensions
 * @param {Buffer} png1 
 * @param {Buffer} png2
 * @typedef {import('../index.d.ts').PixelMatchDiffOptions} PixelMatchDiffOptions
 * @param {PixelMatchDiffOptions} options
 * @returns {Buffer} RGBA
 */
export function diffPNG(png1, png2, options) {
	const [img1, img2] = growSmallestSides(
		PNG.sync.read(png1),
		PNG.sync.read(png2))
	const { width, height } = img1
	const outDiff = new PNG({ width, height })
	const nDiffPx = pixelmatch(img1.data, img2.data, outDiff.data, width, height, options) 
	if (nDiffPx)
		return PNG.sync.write(outDiff)
}


function growSmallestSides(img1, img2) {
	const maxWidth = Math.max(img1.width, img2.width)
	const maxHeight = Math.max(img1.height, img2.height)
	for (const img of [img1, img2]) {
		if (img.width !== maxWidth)
			growWidth(img, maxWidth)
		if (img.height !== maxHeight)
			growHeight(img, maxHeight)
	}
	return [img1, img2]
}

function growWidth(img, newWidth) {
	const pixels = fillWithBlack(newWidth, img.height)
	for (let y = 0; y < img.height; y++)
		for (let x = 0; x < img.width; x++) {
			const i = 4 * (x + y * img.width)
			const j = 4 * (x + y * newWidth)
			for (let k = 0; k < 4; k++)
				pixels[j + k] = img.data[i + k]
		}
	img.data = pixels
	img.width = newWidth
}

function growHeight(img, newHeight) {
	const pixels = fillWithBlack(img.width, newHeight)
	for (let y = 0; y < img.height; y++)
		for (let x = 0; x < img.width; x++) {
			const i = 4 * (x + y * img.width)
			for (let k = 0; k < 4; k++)
				pixels[i + k] = img.data[i + k]
		}
	img.data = pixels
	img.height = newHeight
}

function fillWithBlack(width, height) {
	const pixels = new Uint8Array(4 * width * height)
	for (let i = 3; i < pixels.length; i += 4)
		pixels[i] = 255 // Alpha 100%
	return pixels
}

