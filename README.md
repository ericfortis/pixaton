<img src="pixaton-logo.svg" alt="Pixaton Logo" width="180" style="margin-top: 30px"/>
 
Pixaton is a collection of helpers for testing UIs by pixel diffing screenshots.

The automation is done with [Puppeteer](https://pptr.dev/), and the diffing with
[pixelmatch](https://github.com/mapbox/pixelmatch). The `testPixels` helper forwards
their configuration options to them. Take a look at [index.d.ts](index.d.ts) for details.

For speed, Pixaton reuses the headless browser instance, so some
setup is required, see [demo-tests/_setup.js](demo-tests/_setup.js)

Also for speed, it uses `--experimental-test-isolation=none`, so you’ll need Node v22.9+

## TL;DR

```js
// Create a wrapper helper in your main setup file:
import { testPixels } from './_setup.js'

testPixels(
  import.meta.filename, // uses the filename as test name
  '/', // URL path
  'main', // CSS Selector
  {
    async setup(page) {
      await page.type('input[type=email]', 'john@example.com')
    }
  }
)
```

Here’s an example report. The button now has rounded corners.

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
- `npm install`
- `npm install mockaton` (for running the demo app)
- `npm run demo`
- `npm run demo-test` (in another terminal tab)

The above report should open. That is, `demo-tests/login-form.gold.png`
is outdated. In that screenshot, the login button has squared
corners, but the current `demo-app/index.html` has rounded corners.

