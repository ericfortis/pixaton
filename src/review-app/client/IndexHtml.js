import { API } from './ApiConstants.js'

export const CSP = [
	`default-src 'self'`,
	`img-src data: blob: 'self'`
].join(';')

// language=html
export const IndexHtml = (hotReloadEnabled, version) => `
	<!DOCTYPE html>
	<html lang="en-US">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="icon" href="data:image/svg+xml,%3Csvg viewBox='0 0 960 960' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m436 586q-18.3 0-29-14-9.67-15-9.67-39.8 0-54.8 45.1-54.8h114q39.8 0 55.9-22.6 17.2-22.6 17.2-49.4v-176q0-26.9-17.2-49.4-16.1-22.6-55.9-22.6h-226v702q0 51.6-64.5 51.6-62.3 0-62.3-51.6v-746q0-38.7 19.3-51.6 19.3-12.9 47.3-12.9h314q26.9 0 57 11.8 30.1 11.8 58 30.1h-1.07q27.9 20.4 43 53.7 15 32.2 15 75.2v195q0 87.1-58 130-27.9 20.4-57 31.2-29 10.7-57 10.7z' fill='%23808080'/%3E%3C/svg%3E" />
		<script type="module" src="app.js"></script>
		<title>Pixaton v${version}</title>
	</head>
	<body>
	${hotReloadEnabled
		? `<script type="module" src="utils/watcherDev.js?url=${API.watchHotReload}"></script>`
		: ''}
	</body>
	</html>
`
