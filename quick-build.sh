#!/usr/bin/env sh

# build all packages:

cd packages
# for package in "validation" "core" "utilities" "cli" "test" "artifacts"
for package in "core" "test"
do
  (cd $package; npm run build)
done


# none of these should break/crash!:

cd test && npm test && cd ..
# cd artifacts && npm run generate && cd ..
# cd cli && node dist/lionweb-cli.js && cd ..
# cd validation && npm test && cd ..


# run linting:

# cd ..
npm run lint