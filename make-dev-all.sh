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

cd json-diff
npm run build
cd ..

cd json-utils
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

cd test
npm test
cd ..

cd .. # (/<root>)


./make-class-core.sh

# (doesn't bother with dependency order:)
npm run lint

