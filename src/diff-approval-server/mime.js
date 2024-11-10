const mimes = {
	css: 'text/css',
	html: 'text/html',
	js: 'application/javascript',
	json: 'application/json',
	png: 'image/png',
	svg: 'image/svg+xml'
}

export function mimeFor(filename) {
	const ext = filename.replace(/.*\./, '')
	const mime = mimes[ext] || ''
	if (!mime)
		console.error(`Missing MIME for ${filename}`)
	return mime
}
