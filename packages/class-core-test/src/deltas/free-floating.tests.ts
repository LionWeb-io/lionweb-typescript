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

import { ChildAddedDelta, collectingDeltaReceiver } from "@lionweb/class-core"

import { NonPartitionTestConcept, PartitionTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isFalse, isTrue } from "../assertions.js"

const testLanguage = TestLanguageBase.INSTANCE

describe(`"free-floating" nodes`, () => {

    it(`only 1 "child added" event should be sent`, () => {
        isTrue(testLanguage.PartitionTestConcept.partition);
        isFalse(testLanguage.NonPartitionTestConcept.partition);

        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const parent = PartitionTestConcept.create("parent", receiveDelta);
        equal(deltas.length, 0);
        // Note: no delta sent, because only an explicit client call will generate a PartitionAdded event.

        const child1 = NonPartitionTestConcept.create("child_1", receiveDelta);
        child1.name = "child 1";
        const child2 = NonPartitionTestConcept.create("child_2", receiveDelta);
        child2.name = "child 2";
        child1.nestedChild = child2;
        deepEqual(deltas.map((delta) => delta.constructor.name), []);

        parent.child = child1;
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(parent, testLanguage.PartitionTestConcept_child, 0, child1));
    });

});

