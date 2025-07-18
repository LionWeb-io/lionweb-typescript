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

import { expect } from "chai"

import { delayed } from "./async.js"


describe("testing asynchronous stuff with Mocha(+Chai)", function() {

    /**
     * **NOTE**: needs to be a “legacy” (async) function declaration, not a double arrow one!
     *
     * (This is really a meta test that documents how we can and should use Mocha(+Chai) for asynchronous stuff.)
     */
    it("awaiting (=effectively a then-chain) waits before running assertions", async function() {
        let flag = false
        flag = await delayed(10, true)
        expect(flag).to.equal(true)
    })

})

