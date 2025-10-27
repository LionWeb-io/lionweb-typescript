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

const uniquesAmong = (ts) => [...new Set(ts)]

const checkPackage = (packagePath) => {
    const packageJson = JSON.parse(readFileSync(join(packagePath, "package.json"), { encoding: "utf8" }))
    console.log(`checking imports vs. listed dependencies of package: ${packageJson.name}`)
    const sourcePath = join(packagePath, "src")
    const harvestImportsFrom = (sourceFile) =>
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
                .filter((path) => path.endsWith(".ts"))
                .flatMap((sourceFile) => harvestImportsFrom(join(sourcePath, sourceFile)))
        ).toSorted()
    console.log(`\timported dependencies: ${importedDependencies.join(" ")}`)

    const importDependenciesNotInPackageJson = importedDependencies
        .filter((dep) => !(dep in (packageJson.dependencies ?? {})))
    if (importDependenciesNotInPackageJson.length > 0) {
        console.error(`\tthe following imported dependencies are not listed under the dependencies in package.json: ${importDependenciesNotInPackageJson.join(" ")}`)
    }

    const unusedDependenciesInPackageJson = Object.keys(packageJson.dependencies ?? {})
        .filter((dep) => importedDependencies.indexOf(dep) === -1)
    if (unusedDependenciesInPackageJson.length > 0) {
        console.error(`\tthe following dependencies listed under the dependencies in package.json are unused: ${unusedDependenciesInPackageJson.join(" ")}`)
    }

    console.log()
}

const topLevelPackageJson = JSON.parse(readFileSync("package.json", { encoding: "utf8" }))

topLevelPackageJson.workspaces.forEach((packagePath) => {
    checkPackage(packagePath)
})

