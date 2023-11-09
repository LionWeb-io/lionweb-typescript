#!/usr/bin/env sh

# build all packages, but without cleaning and installing all deps:

cd packages

for package in "core" "utilities" "cli" "test" "artifacts" "validation"
do
  (cd $package; npm run build)
done


# none of these should break/crash!:

cd test && npm test && cd ..
cd artifacts && npm run generate && cd ..
cd cli && node dist/lionweb-cli.js && cd ..

# run linting:

cd ..
npm run lint

