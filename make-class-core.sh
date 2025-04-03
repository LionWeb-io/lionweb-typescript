cd packages

cd class-core-generator
npm run build
cd ..

# Build class-core first, because class-core-build depends *circularly* on it.
cd class-core
npm run build
cd ..

cd class-core-build
npm run build
RelClassCoreTestGenPath="../class-core-test/src/gen"
rm -rf $RelClassCoreTestGenPath
mkdir -p $RelClassCoreTestGenPath
node dist/generate-for-class-core.js
cd ..

# Build class-core *again*, because part of its sources might have been changed by the previous step.
# (The source code of the class-core package is small, so the impact of building twice is negligible.)
cd class-core
npm run build
cd ..

cd class-core-test
npm test
cd ..

cd .. # (/<root>)

