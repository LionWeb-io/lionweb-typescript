#!/usr/bin/env sh

# none of these should break/crash!:

pushd packages/test && npm test && popd
pushd packages/artifacts && npm run generate && popd
pushd packages/cli && node dist/lionweb-cli.js && popd
pushd packages/validation && npm test && popd

