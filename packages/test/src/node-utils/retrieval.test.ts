// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import { retrieval } from "@lionweb/node-utils"

import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { equal, fail, isTrue } from "../test-utils/assertions.js"


const testPath = "artifacts/node-utils"
const destinationPath = join(testPath, "destination.txt")
const localSourcePath = join(testPath, "source.txt")


describe("retrieval falls back to local copying", () => {

    const expectFallbackToLocalCopying = async (sourceURL: string) => {
        const contents = `${Math.random()}`
        await writeFile(localSourcePath, contents)
        await retrieval({
            sourceURL,
            destinationPath,
            localSourcePath
        })
        equal((await readFile(destinationPath)).toString(), contents)
    }

    it("host doesn’t exist", async () => {
        await expectFallbackToLocalCopying("https://foo.bar")
    })

    it("host returns a 404", async () => {
        await expectFallbackToLocalCopying("https://www.dslconsultancy.com/foo")
    })

})


describe("retrieval with forcing local copy", () => {

    const expectForcedLocalRetrievalToFailWith = async (localSourcePath: string, message: string) => {
        await retrieval({
            sourceURL: "bogus: not accessed",
            destinationPath,
            forceLocalCopying: true,
            localSourcePath
        })
            .then(() => {
                fail("expected a rejection")
            })
            .catch((reason) => {
                isTrue(reason instanceof Error)
                equal(reason.message, message)
            })
    }

    it("fails understandably when sub path of local source path doesn’t exist", async () => {
        await expectForcedLocalRetrievalToFailWith("artifacts/non-existing/source.txt", "path artifacts/non-existing/source.txt doesn’t exist")
    })

    it("fails understandably when local source path doesn’t exist", async () => {
        await expectForcedLocalRetrievalToFailWith("artifacts/node-utils/non-existing-path.txt", "path artifacts/node-utils/non-existing-path.txt doesn’t exist")
    })

    it("fails understandably when local source path is not a file", async () => {
        await expectForcedLocalRetrievalToFailWith("artifacts/node-utils", "path artifacts/node-utils is not a file")
    })

})

