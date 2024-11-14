<img src="pixaton-logo.svg" alt="Pixaton Logo" width="180" style="margin-top: 30px"/>
 
Pixaton is a collection of [Puppeteer](https://pptr.dev/) helpers for testing UIs by pixel diffing screenshots.

On an M1 MBP, 120 screenshots take about 60 seconds, 
which is 12X faster than the alternative SaaS offerings.

For speed, Pixaton reuses the headless browser instance, so some setup
is required. 
- See [demo-tests/_setup.js](demo-tests/_setup.js)
  - There you can specify your defaults. For example, the viewport sizes and preferred color schemes.
- It uses `--experimental-test-isolation=none`, so you’ll need Node v22.9+
  - See the `demo-test` script runner in [package.json](package.json)

Pixaton forwards its configuration options to Puppeteer and
[Pixelmatch](https://github.com/mapbox/pixelmatch), so it doesn’t
limit versatility. Take a look at [index.d.ts](index.d.ts) for the options.


## TL;DR

```sh
npm install puppeteer pixaton
```

```js
// Create a wrapper in your main setup file:
import { myTestPixels } from './_setup.js'

myTestPixels(
  import.meta.filename, // For using the filename as the test name
  '/', // URL path
  'main', // CSS Selector
  {
    async setup(page) {
      await page.type('input[type=email]', 'john@example.com')
    }
  }
)
```

Here’s an example report, where the login button now has rounded corners.

<img src="./README-example-diff.png" />

Hitting **Approve Candidate** renames the corresponding
`.candidate.png` to `.gold.png`, and deletes `.diff.png`

The gold screenshots are meant to be saved in your
repository. So exclude the temporary PNGs.
### .gitignore
```shell
demo-tests/*.diff.png
demo-tests/*.candidate.png
```


## Getting Started Demo
- Checkout this repository
  - `git clone https://github.com/ericfortis/pixaton.git`
  - `cd pixaton`
- `npm install`
- `npm install mockaton` (for running the demo app)
- `npm run demo`
- `npm run demo-test` (in another terminal tab)

The above report will open showing a diff of the login button with rounded corners.


## More Examples
- [Mockaton](https://github.com/ericfortis/mockaton) uses Pixaton, so you could explore [those examples](https://github.com/ericfortis/mockaton/tree/main/ui-tests) as well

## Licence
MIT
