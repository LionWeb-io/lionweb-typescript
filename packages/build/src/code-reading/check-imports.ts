// Copyright 2025 TRUMPF Laser SE and other contributors
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-FileCopyrightText: 2025 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import { readdirSync, readFileSync } from "fs"
import { join } from "path"

const uniquesAmong = <T>(ts: T[]) => [...new Set(ts)]

/**
 * Check the package at the given `packagePath`.
 * @return {boolean} Whether an issue was reported for this package.
 * Any issue is reported directly on the console (as a side effect).
 */
const checkPackage = (packagePath: string) => {
    let hasIssue = false
    const reportIssue = (message: string) => {
        console.error(message)
        hasIssue = true
    }
    const packageJson = JSON.parse(readFileSync(join(packagePath, "package.json"), { encoding: "utf8" }))
    console.log(`checking imports vs. listed dependencies of package: ${packageJson.name}`)
    const sourcePath = join(packagePath, "src")
    const harvestImportsFrom = (sourceFile: string) =>
        readFileSync(sourceFile, { encoding: "utf8" })
            .split(/\r?\n/)
            .map((line) => line.match(/^.+?from "([^.].+)"[\s;]*$/))
            .filter((matchOrNull) => matchOrNull !== null)
            .map((match) => match[1])
            .map((dep) => {
                const distIndex = dep.indexOf("/dist/")
                return distIndex === -1
                    ? dep
                    : dep.substring(0, distIndex)
            })

    const importedDependencies = uniquesAmong(
            readdirSync(sourcePath, { recursive: true })
                .filter((path) => path.toString().endsWith(".ts"))
                .flatMap((sourceFile) => harvestImportsFrom(join(sourcePath, sourceFile.toString())))
        ).sort()
    console.log(`\timported dependencies: ${importedDependencies.join(" ")}`)

    const isEnvironmental = (dep: string) => // Node.js, Mocha, Chai
        ["@types/node", "assert", "chai", "crypto", "fs", "fs/promises", "http", "https", "mocha", "path", "process", "timers"].indexOf(dep) > -1

    const importDependenciesNotInPackageJson = importedDependencies
        .filter((dep) => !(dep in (packageJson.dependencies ?? {})))
        .filter((dep) => !isEnvironmental(dep))
    if (importDependenciesNotInPackageJson.length > 0) {
        reportIssue(`\t\x1b[41m\x1b[37mthe following imported dependencies are *not* listed under the dependencies in package.json: ${importDependenciesNotInPackageJson.join(" ")}\x1b[0m`)
    }

    const unusedDependenciesInPackageJson = Object.keys(packageJson.dependencies ?? {})
        .filter((dep) => importedDependencies.indexOf(dep) === -1)
        .filter((dep) => !isEnvironmental(dep))
    if (unusedDependenciesInPackageJson.length > 0) {
        reportIssue(`\t\x1b[43m\x1b[37mthe following dependencies listed under the dependencies in package.json are unused: ${unusedDependenciesInPackageJson.join(" ")}\x1b[0m`)
    }

    console.log()
    return hasIssue
}

const topLevelPackageJson = JSON.parse(readFileSync("package.json", { encoding: "utf8" }))

const packagesWithIssues = (topLevelPackageJson.workspaces as string[])
    .sort()
    .filter((packagePath) => checkPackage(packagePath))

if (packagesWithIssues.length === 0) {
    console.log(`\n\x1b[43m\x1b[37mno issues reported (on any package)\x1b[0m`)
} else {
    console.error(`\n\x1b[41m\x1b[37mthe following packages have issues reported on them: ${packagesWithIssues.map((packagePath) => packagePath.substring("./packages/".length)).join(", ")}\x1b[0m`)
}

