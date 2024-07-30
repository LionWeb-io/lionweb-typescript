const { exec } = require("child_process")
const { writeFileSync, readFileSync } = require("fs")
const { join } = require("path")
const { EOL } = require("os")


const package2version = require("./packages/versions.json")


const fqPrefix = "@lionweb/"

const replaceVersionsIn = (deps) => {
    Object.entries(deps)
        .forEach(([dep, currentVersion]) => {
            if (dep.startsWith(fqPrefix)) {
                const uqDep = dep.substring(fqPrefix.length)
                if (uqDep in package2version) {
                    const desiredVersion = package2version[uqDep]
                    if (desiredVersion !== currentVersion) {
                        console.log(`   replacing dep for ${uqDep}: ${currentVersion} -> ${desiredVersion}`)
                        deps[dep] = desiredVersion
                    }
                }
            }
        })
}


const readFileAsJson = (path) =>
    JSON.parse(readFileSync(path, { encoding: "utf8" }))

const writeJsonAsFile = (path, json) => {
    writeFileSync(path, JSON.stringify(json, null, 2) + EOL)
}


Object
    .keys(package2version)
    .forEach((pkg) => {
        console.log(`updating versions in package.json of package "${pkg}"...`)
        const packageJsonPath = join("packages", pkg, "package.json")
        const packageJson = readFileAsJson(packageJsonPath)
        packageJson.version = package2version[pkg]
        if ("dependencies" in packageJson) {
            replaceVersionsIn(packageJson.dependencies)
        }
        if ("devDependencies" in packageJson) {
            replaceVersionsIn(packageJson.devDependencies)
        }
        writeJsonAsFile(packageJsonPath, packageJson)
        console.log(`(done)`)
        console.log()
    })

console.log(`updating package-lock.json...`)
exec("npm install")
console.log(`(done)`)
console.log()

