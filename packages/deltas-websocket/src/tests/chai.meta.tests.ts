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


describe("Chai (vs. objects)", () => {

    interface MyInterface {}

    class ClassA implements MyInterface {
        constructor(public readonly fieldA: string, public readonly objectField: object) {}
    }

    class ClassB implements MyInterface {
        constructor(public readonly fieldB: string) {}
    }

    /**
     * This is really a meta test that documents how we can and should use Chai
     * with objects with [only] public-readonly parameters in their object constructors,
     * i.e.: "records".
     */
    it(`can meaningfully deep-equal "records"`, () => {
        const instance1OfA = new ClassA("value A", { foo: 42 })
        const instance2OfA = new ClassA("value A", { foo: 42 })
        const instance3OfA = new ClassA("value B", { foo: 42 })
        const instance4OfA = new ClassA("value B", { foo: 37 })
        const instanceOfB = new ClassB("value B")

        expect(instance1OfA).to.deep.equal(instance1OfA)
        expect(instance1OfA).to.deep.equal(instance2OfA)
        expect(instance1OfA).to.not.deep.equal(instance3OfA)
        expect(instance1OfA).to.not.deep.equal(instance4OfA)
        expect(instance1OfA).to.not.deep.equal(instanceOfB)

        expect(instance2OfA).to.deep.equal(instance2OfA)
        expect(instance2OfA).to.not.deep.equal(instance3OfA)
        expect(instance2OfA).to.not.deep.equal(instance4OfA)
        expect(instance2OfA).to.not.deep.equal(instanceOfB)

        expect(instance3OfA).to.deep.equal(instance3OfA)
        expect(instance3OfA).to.not.deep.equal(instance4OfA)
        expect(instance3OfA).to.not.deep.equal(instanceOfB)

        expect(instance4OfA).to.deep.equal(instance4OfA)
        expect(instance4OfA).to.not.deep.equal(instanceOfB)

        expect(instanceOfB).to.deep.equal(instanceOfB)
    })

})

