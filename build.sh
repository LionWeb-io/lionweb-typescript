#!/usr/bin/env sh

rm -rf node_modules
npm ci

pushd packages

for package in "core" "utilities" "cli" "artifacts" "test"
do
  pushd $package
  ./build.sh
  popd
done

popd

