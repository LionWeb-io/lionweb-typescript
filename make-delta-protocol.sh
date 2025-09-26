#!/bin/sh

set -e

cd packages

cd delta-protocol-impl
npm run build
cd ..

cd delta-protocol-test-cli
npm run build
cd ..

cd delta-protocol-test
npm test    # also runs build
cd ..

cd .. # (/<root>)

