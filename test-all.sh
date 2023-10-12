#!/usr/bin/env sh

cd packages

# none of these should break/crash!:

cd test && npm test && cd ..
cd artifacts && npm run generate && cd ..
cd cli && node dist/lionweb-cli.js && cd ..
cd validation && npm test && cd ..

cd ..

