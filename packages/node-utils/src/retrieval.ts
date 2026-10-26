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

import { Stats } from "node:fs"
import { copyFile, stat, writeFile } from "node:fs/promises"

import { getFromHttps } from "./curl.js"


/**
 * Parameters for the {@link retrieval} function.
 */
export type RetrievalParameters = {
    /** The URL of a file to retrieve. */
    sourceURL: string
    /** The path – including file name! – to write the file to. */
    destinationPath: string
    /**
     * Whether the retrieval from the source URL should be skipped,
     * forcing to copy the file from a local source path.
     */
    forceLocalCopying?: boolean
    /** The local source path to retrieve the file from. */
    localSourcePath: string
}

/**
 * Retrieves a file according to the given {@link RetrievalParameters}.
 */
export const retrieval = ({ sourceURL, destinationPath, forceLocalCopying, localSourcePath }: RetrievalParameters): Promise<void> => {
    const copyFromLocal = async () => {
        let stats: Stats
        try {
            stats = await stat(localSourcePath)
        } catch (_error) {
            throw new Error(`path ${localSourcePath} doesn’t exist`)
        }

        if (!stats.isFile()) {
            throw new Error(`path ${localSourcePath} is not a file`)
        } else {
            await copyFile(localSourcePath, destinationPath)
            console.info(`copied file from ${localSourcePath} -> ${destinationPath}`)
        }
    }

    return forceLocalCopying
        ? copyFromLocal()
        : getFromHttps(sourceURL)
            .then((fileAsBuffer) =>
                writeFile(destinationPath, fileAsBuffer)
                    .then(() => {
                        console.info(`retrieved file from ${sourceURL} as: ${destinationPath}`)
                    })
                    .catch((error) => {
                        console.error(`couldn't write file to ${destinationPath}, due to: ${error}`)
                    })
            )
            .catch((error) => {
                console.warn(`couldn't retrieve file from ${sourceURL}, due to: ${error}`)
                return copyFromLocal()
            })
}

