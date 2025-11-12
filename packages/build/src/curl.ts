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

import https from "https"


/**
 * @return the contents of the given `url` as a promised {@link Buffer}, properly taking care of errors.
 */
export const getFromHttps = async (url: string): Promise<Buffer> =>
    new Promise((resolve, reject) => {
        let buffer = Buffer.from("")
        try {
            https
                .get(url, (response) => {
                    response.on("data", (piece) => {
                        buffer = Buffer.concat([buffer, piece])
                    })
                    response.on("end", () => {
                        resolve(buffer)
                    })
                    response.on("error", (error) => {
                        reject(error)
                    })
                })
                .on("error", (error) => {
                    reject(error)
                })
        } catch (error) {
            reject(error)
        }
    })

