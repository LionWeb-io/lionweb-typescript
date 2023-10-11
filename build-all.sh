#!/usr/bin/env sh

rm -rf node_modules
npm ci

pushd packages

for package in "validation" "core" "utilities" "cli" "test" "artifacts"
do
  (cd $package; ./build.sh)
done

popd

