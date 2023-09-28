#!/usr/bin/env sh

rm -rf dist/ node_modules/ lionweb-cli-*.tgz
npm i
npm run build

