#!/usr/bin/env sh

# build all packages, but without cleaning and installing all deps:

cd packages

for package in "core" "utilities" "cli" "validation" "test" "artifacts"
do
  (cd $package; npm run build)
done

cd ..


# run linting:

npm run lint

