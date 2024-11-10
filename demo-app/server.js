#!/usr/bin/env node

import { join } from 'node:path'
import { Mockaton } from 'mockaton'


Mockaton({
	mocksDir: join(import.meta.dirname, 'api-mocks'),
	staticDir: join(import.meta.dirname, 'static'),
	port: 55201
})
