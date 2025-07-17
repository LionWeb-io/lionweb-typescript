#!/bin/sh
# Script to build all packages — it does so *in their dependency order*.

# Have script exit after first failure is detected:
set -e


cd packages

cd ts-utils
npm run build
cd ..

cd textgen-utils
npm run build
cd ..

cd json
npm run build
cd ..

cd json-utils
npm run build
cd ..

cd json-diff
npm run build
cd ..

cd core
npm run build
cd ..

cd utilities
npm run build
cd ..

cd validation
npm run build
cd ..

cd cli
npm run build
cd ..

cd io-lionweb-mps-specific
npm run build
cd ..

cd class-core-generator
npm run build
cd ..

# Build class-core first, because build depends *circularly* on it.
cd class-core
npm run build
cd ..

cd build
ClassCoreTestGenPath="../class-core-test/src/gen"   # relative!
rm -rf $ClassCoreTestGenPath
mkdir -p $ClassCoreTestGenPath
npm run generate
cd ..

# Build class-core *again*, because part of its sources might have been changed by the previous step.
# (The source code of the class-core package is small, so the performance impact of building twice is negligible.)
cd class-core
npm run build
cd ..

cd class-core-test
npm test
cd ..

cd test
npm test
cd ..

cd artifacts
npm run generate
cd ..

cd .. # (/<root>)

# (doesn't bother with dependency order:)
npm run lint

