#!/usr/bin/env node


const versions = require("../versions.json")
const {
    "internal-packages": internalPackages
} = versions.lionweb

const globalPackageJson = require("../package.json")
const { workspaces } = globalPackageJson

const packagesPrefix = "./packages/"
const publishedPackages = workspaces
    .filter((path) => path.startsWith(packagesPrefix))
    .map((path) => path.substring(packagesPrefix.length))
    .filter((pkgName) => internalPackages.indexOf(pkgName) === -1)
    .sort()

const badges = publishedPackages
    .map((pkgName) => `[![npm](https://img.shields.io/npm/v/%40lionweb%2F${pkgName}?label=%40lionweb%2F${pkgName})
](https://www.npmjs.com/package/@lionweb/${pkgName})`)

console.log(badges.join("\n"))

