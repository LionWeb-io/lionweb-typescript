#!/bin/sh

set -e

cd packages

cd delta-protocol-common
npm run build
cd ..

cd delta-protocol-client
npm run build
cd ..

cd delta-protocol-low-level-client-ws
npm run build
cd ..

cd delta-protocol-low-level-client-browser
npm run build
cd ..

cd delta-protocol-repository-ws
npm run build
cd ..

cd delta-protocol-test-cli
npm run build
cd ..

cd delta-protocol-test
npm test    # also runs build
cd ..

cd .. # (/<root>)

