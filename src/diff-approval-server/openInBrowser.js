import { exec } from 'node:child_process'


export function openInBrowser(address) {
	switch (process.platform) {
		case 'darwin':
			exec(`open ${address}`)
			break
		case 'win32': // TESTME
			exec(`start ${address}`)
			break
	}
}

