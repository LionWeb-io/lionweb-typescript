#!/bin/sh

set -e

cd packages

cd class-core
npm run build
cd ..

cd class-core-test
npm test    # also runs build
cd ..

cd .. # (/<root>)

