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

import { waitUntil } from "@lionweb/delta-protocol-test-cli/dist/async.js"


describe("async", function() {

    it("waitUntil", async function() {
        const waitTime = 10
        const expectedNumberOfChecks = 5
        let numberOfChecks = 0
        let condition = false
        setTimeout(() => {
            condition = true
        }, Math.round(waitTime * (expectedNumberOfChecks + 0.5)))
        await waitUntil(10, () => {
            numberOfChecks++
            return condition
        })
        expect(Math.abs(numberOfChecks - expectedNumberOfChecks) <= 1).to.equal(true)
    })

    it("sequential execution using a chain of Promise-s", async function() {
        let started = 0
        let finished = 0
        const checked = (num: number): void => {
            expect(started).to.equal(num, "#started")
            expect(finished).to.equal(num, "#finished")
        }

        const newTask = (): Promise<void> => new Promise((resolve) => {
            started++
            setTimeout(() => {
                ++finished
                resolve(undefined)
            }, 10)
        })
        const execution = newTask()
            .then(() => checked(1))
            .then(() => newTask())
            .then(() => checked(2))
            .then(() => newTask())
            .then(() => checked(3))

        expect(started).to.equal(1)
        expect(finished).to.equal(0)
        await execution
    })

    it("sequential execution using for of-await", async function() {
        let started = 0
        let finished = 0
        const checked = (num: number): void => {
            expect(started).to.equal(num, "#started")
            expect(finished).to.equal(num, "#finished")
        }

        const newTask = (): Promise<void> => new Promise((resolve) => {
            started++
            setTimeout(() => {
                ++finished
                resolve(undefined)
            }, 10)
        })

        const taskNumbers = [0, 1, 2]
        for (const taskNumber of taskNumbers) {
            checked(taskNumber)
            await newTask()
            checked(taskNumber + 1)
        }
    })

})

