const { exec } = require("child_process")
const { writeFileSync, readdirSync, readFileSync } = require("fs")
const { join } = require("path")
const { EOL } = require("os")


const versions = require("./versions.json")

const {
    "publish-version": publishVersion,
    "internal-version": internalVersion,
    "internal-packages": internalPackages
} = versions.lionweb
const {"external-deps": externalDeps} = versions

const ownPackageVersion = (dep) =>
    internalPackages.indexOf(dep) > -1
        ? internalVersion
        : publishVersion

const fqPrefix = "@lionweb/"

const replaceVersionsIn = (deps, doNotWarnOnUnlisted) => {
    Object.entries(deps)
        .forEach(([dep, currentVersion]) => {
            if (dep.startsWith(fqPrefix)) {
                const uqDep = dep.substring(fqPrefix.length)
                const desiredVersion = ownPackageVersion(uqDep)
                if (desiredVersion !== currentVersion) {
                    console.log(`   replacing dep for ${uqDep}: ${currentVersion} -> ${desiredVersion}`)
                    deps[dep] = desiredVersion
                }
            } else {
                if (dep in externalDeps) {
                    const desiredVersion = externalDeps[dep]
                    if (desiredVersion !== currentVersion) {
                        console.log(`   replacing dep for ${dep}: ${currentVersion} -> ${desiredVersion}`)
                        deps[dep] = desiredVersion
                    }
                } else {
                    if (!doNotWarnOnUnlisted) {
                        console.log(`   encountered unlisted external dep: ${dep} @ ${currentVersion}`)
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

readFileAsJson("package.json")
    .workspaces
    .map((path) => path.substring("./packages/".length))
    .forEach((pkg) => {
        console.log(`updating versions in package.json of package "${pkg}"...`)
        const packageJsonPath = join("packages", pkg, "package.json")
        const packageJson = readFileAsJson(packageJsonPath)
        packageJson.version = ownPackageVersion(pkg)
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

const mainPackageJson = readFileAsJson("package.json")
replaceVersionsIn(mainPackageJson.devDependencies, true)
writeJsonAsFile("package.json", mainPackageJson)

console.log(`updating package-lock.json...`)
exec("npm install")
console.log(`(done)`)
console.log()

