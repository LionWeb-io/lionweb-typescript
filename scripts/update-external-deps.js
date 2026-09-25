#!/usr/bin/env node


import { exec } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { EOL } from "node:os"
import { argv } from "node:process"
import { compare as semverCompare } from "semver"


import versions from "../versions.json" with { type: "json" }
const { "external-deps": externalDeps } = versions

const updateExternalDepsVersionsFlag = "--update"
const updateExternalDepsVersions = argv[2] === updateExternalDepsVersionsFlag

const minReleaseAge = (await readFile(".npmrc", { encoding: "utf-8" })).match(/min-release-age=(\d+)/m)[1]

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

const lastOf = (ts) => ts[ts.length - 1]

const processExternalDep = (dep, installedVersion) =>
    execAsPromise(`npm view ${dep} --json`)
        .then((stdout) => {
            const json = JSON.parse(stdout)
            const versionsPerDate = json[0].time
            const now = Date.now()
            const latestAcceptableVersion = lastOf(
                Object
                    .entries(versionsPerDate)
                    .map(([version, dateTimeAsString]) => [version, new Date(dateTimeAsString)])
                    .filter(([version, dateTime]) =>
                        (now - dateTime) >= minReleaseAge*24*60*60*1000     // [days]
                        && version.match(/^\d+\.\d+\.\d+$/)                 // proper semver
                    )
                    .sort(([leftVersion, _leftDateTime], [rightVersion, _rightDateTime]) => semverCompare(leftVersion, rightVersion))
            )[0]
            if (!latestAcceptableVersion) {
                console.warn(`Couldn’t retrieve latest version info for NPM package: ${dep}`)
                return false
            }
            if (latestAcceptableVersion !== installedVersion) {
                if (updateExternalDepsVersions) {
                    externalDeps[dep] = latestAcceptableVersion
                    console.info(`Updated NPM package ${dep} from version ${installedVersion} -> ${latestAcceptableVersion}`)
                } else {
                    console.info(`Newer(/other) version of NPM package ${dep} available: ${latestAcceptableVersion} (<- ${installedVersion})`)
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
        await writeFile("versions.json", JSON.stringify(versions, null, 4) + EOL)
        console.info("Updated version.json.")
    } else {
        console.info(`Some external dependencies have newer(/other) versions available: see above.
Run this script with "${updateExternalDepsVersionsFlag}" as argument to update them automatically.
Then run ./scripts/update-package-versions.js to propagate that to the packages.
`)
    }
}

