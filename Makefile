test:
	node --test 'src/**/*.test.js'
	
demo:
	node --test --import=./demo-tests/_setup.js --experimental-test-isolation=none "./demo-tests/**/*.test.js"

dev:
	node src/review-app/server/cli.js --port=4545 demo-tests

.PHONY: *
