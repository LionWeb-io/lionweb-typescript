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

/**
 * Simple, general, sealable registry.
 */
export class Registry<KT, VT> {
    private readonly registry: Map<KT, VT> = new Map<KT, VT>()
    private sealed = false
    constructor(private readonly areSame: (left: KT, right: KT) => boolean) {}
    register(key: KT, value: VT) {
        if (this.sealed) {
            throw new Error(`registry already sealed`)
        }
        if (this.registry.has(key) && this.registry.get(key) !== value) {
            throw new Error(`key already registered with a different value: ${key}`)
        }
        this.registry.set(key, value)
        return this
    }
    seal() {
        if (this.sealed) {
            throw new Error(`registry already sealed`)
        }
        this.sealed = true
        return this
    }
    get lookupByKey(): (key: KT) => VT | undefined {
        if (!this.sealed) {
            throw new Error(`registry is not yet sealed`)
        }
        return (targetKey) => {
            for (const [key, value] of this.registry.entries()) {
                if (this.areSame(targetKey, key)) {
                    return value
                }
            }
            return undefined
        }
    }
}

