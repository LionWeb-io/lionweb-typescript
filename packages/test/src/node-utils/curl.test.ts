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

import { getFromHttps } from "@lionweb/node-utils"

import { equal, fail, isTrue } from "../test-utils/assertions.js"


describe(`"curl"`, () => {

    it("detects host not existing", async () => {
        await getFromHttps("https://foo.bar")
            .then(() => {
                fail("expected a rejection")
            })
            .catch((reason) => {
                isTrue(reason instanceof Error)
                equal(reason.code, "ENOTFOUND")
            })
    })

    it("detects host returning a 404", async () => {
        await getFromHttps("https://www.dslconsultancy.com/foo")
            .then(() => {
                fail("expected a rejection")
            })
            .catch((reason) => {
                isTrue(reason instanceof Error)
                equal(reason.message, "not OK: status code = 404")
            })
    })

})

