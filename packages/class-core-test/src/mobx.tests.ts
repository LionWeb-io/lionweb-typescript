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

import { makeObservable, observable, observe } from "mobx"

import { fail } from "./assertions.js"


describe("MobX", () => {

    class SomeClass {
        _value = observable.box<string | undefined>(undefined, { deep: false })
        get value() {
            return this._value.get()
        }
        set value(newValue: string | undefined) {
            this._value.set(newValue)
        }
        constructor() {
            makeObservable(this) // Note: is required for the unit test below to succeed.
        }
    }

    /**
     * This test just checks behavior of MobX — it bears no actual relevance to the rest of the code.
     *
     * Note: this doesn’t imply that observer(<stateless React component instance />) doesn't work!
     * SomeClass is of the right type — IObservableValue
     */
    it("can't observe an instance as a whole", (done) => {
        const instance = new SomeClass()
        observe(instance, (change) => {
            console.dir(change)
            fail("saw object changing")
        }/*, true: causes an error right away: "[MobX] `observe` doesn't support the fire immediately property for observable objects." */)
        instance.value = "bar"
        done()
    })

})

