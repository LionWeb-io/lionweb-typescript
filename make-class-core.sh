#!/bin/sh

set -e

cd packages

cd class-core
npm run build
cd ..

cd class-core-test-language
npm run build
cd ..

cd class-core-test
rm -rf dist/
npm test    # also runs build
cd ..

cd .. # (/<root>)

