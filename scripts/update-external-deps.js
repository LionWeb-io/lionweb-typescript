#!/usr/bin/env node


import { exec } from "child_process"
import { argv } from "process"
import { writeFileSync } from "fs"
import { EOL } from "os"


import versions from "../versions.json" with { type: "json" }
const {"external-deps": externalDeps} = versions

const updateExternalDepsVersionsFlag = "--update"
const updateExternalDepsVersions = argv[2] === updateExternalDepsVersionsFlag

const execAsPromise = async (command) =>
    new Promise((resolve, reject) => {
        exec(command, (error, stdout, _stderr) => {
            if (error) {
                reject(error)
            } else {
                resolve(stdout)
            }
        })
    })

const processExternalDep = (dep, installedVersion) =>
    execAsPromise(`npm view ${dep}`)
        .then((stdout) => {
            const latestFind = stdout.match(/^latest: (.+?)$/m)
            if (!latestFind) {
                console.warn(`Couldn’t retrieve latest version info for NPM package: ${dep}`)
                return false
            }
            const latestVersion = latestFind[1]
            if (latestVersion !== installedVersion) {
                if (updateExternalDepsVersions) {
                    externalDeps[dep] = latestVersion
                } else {
                    console.info(`Newer(/other) version of NPM package ${dep} available: ${latestVersion} (<- ${installedVersion})`)
                }
                return true
            }
        })
        .catch((error) => {
            console.warn(`Couldn’t retrieve info for NPM package: ${dep}`)
            console.error(error)
            return false
        })

const externalDepsHaveUpdates = await Promise.all(
        Object.entries(externalDeps).map(([dep, installedVersion]) =>
            processExternalDep(dep, installedVersion)
        )
    )
    .then((updates) =>
        updates.reduce((l, r) => l || r)
    )

if (externalDepsHaveUpdates) {
    if (updateExternalDepsVersions) {
        writeFileSync("../versions.json", JSON.stringify(versions, null, 4) + EOL)
    } else {
        console.info(`Some external dependencies have newer(/other) versions available: see above.
Run this script with "${updateExternalDepsVersionsFlag}" as argument to update them automatically.
Then run ./scripts/update-package-versions.js to propagate that to the packages.
`)
    }
}

