import { testPixels, DEMO_APP_ADDR } from './_setup.js'
import { Commander } from 'mockaton'


testPixels(import.meta.filename, '/', 'main',
	{
		async beforeSuite() {
			const mockaton = new Commander(DEMO_APP_ADDR)
			await mockaton.reset()
			await mockaton.select('api/login.POST.200.json')
		},
		async setup(page) {
			await page.type('input[type=email]', 'user@example.com')
			await page.type('input[type=password]', '1234abcd!')
			await page.click('button[type=submit]')
		},
	}
)
