#!/usr/bin/env sh

rm -rf dist/ node_modules/
rm -rf testset/

npm i

# retrieve just the testset/ directory from its repo (using degit):
npx degit https://github.com/LionWeb-io/lionweb-integration-testing/testset/ testset

npm run build

