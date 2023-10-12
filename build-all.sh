#!/usr/bin/env sh

# install deps cleanly:

rm -rf node_modules
npm ci


# build all packages:

cd packages

for package in "validation" "core" "utilities" "cli" "test" "artifacts"
do
  (cd $package; ./build.sh)
done

cd ..


# run linting:

npm run lint

