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

import { collectingDeltaHandler, ReferenceAddedDelta, ReferenceDeletedDelta } from "@lionweb/class-core"

import { deepEqual, equal, throws } from "../assertions.js"
import { LinkTestConcept, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[1..n] reference", () => {

    it("getting an unset [1..n] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const node = LinkTestConcept.create("node", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        throws(
            () => {
                deepEqual(node.reference_1_n, []);
            },
            `can't read required reference "reference_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=node`
        );
        equal(deltas.length, 0);
    });

    it("adding to a [1..n] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dst1 = LinkTestConcept.create("dst1", handleDeltas);
        const src = LinkTestConcept.create("src", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        src.addReference_1_n(dst1);
        deepEqual(src.reference_1_n, [dst1]);
        equal(dst1.parent, undefined);
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new ReferenceAddedDelta(src, testLanguageBase.LinkTestConcept_reference_1_n, 0, dst1)
        );

        // action+check:
        const dst2 = LinkTestConcept.create("dst2", handleDeltas);
        src.addReference_1_n(dst2);
        deepEqual(src.reference_1_n, [dst1, dst2]);
        equal(dst2.parent, undefined);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ReferenceAddedDelta(src, testLanguageBase.LinkTestConcept_reference_1_n, 1, dst2)
        );
    });

    it("unsetting a [1..n] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dst = LinkTestConcept.create("dst", handleDeltas);
        const src = LinkTestConcept.create("src", handleDeltas);

        // pre-check:
        src.addReference_1_n(dst);
        equal(dst.parent, undefined);
        equal(deltas.length, 1);

        // action+check:
        throws(
            () => {
                src.removeReference_1_n(dst);
            },
            `can't unset required reference "reference_1_n" on instance of TestLanguage.LinkTestConcept with id=src`
        )
        equal(deltas.length, 1);
    });

    it("remove a target", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dst1 = LinkTestConcept.create("dst1", handleDeltas);
        const dst2 = LinkTestConcept.create("dst2", handleDeltas);
        const dst3 = LinkTestConcept.create("dst3", handleDeltas);
        const src = LinkTestConcept.create("src", handleDeltas);

        // pre-check:
        src.addReference_1_n(dst1);
        equal(dst1.parent, undefined);
        src.addReference_1_n(dst2);
        equal(dst2.parent, undefined);
        src.addReference_1_n(dst3);
        equal(dst3.parent, undefined);
        equal(deltas.length, 3);

        // action+check:
        src.removeReference_1_n(dst2);
        deepEqual(src.reference_1_n, [dst1, dst3]);
        equal(deltas.length, 4);
        deepEqual(
            deltas[3],
            new ReferenceDeletedDelta(src, testLanguageBase.LinkTestConcept_reference_1_n, 1, dst2)
        );
    });

    it("trying to remove a target that wasn't in there", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dst1 = LinkTestConcept.create("dst1", handleDeltas);
        const src = LinkTestConcept.create("src", handleDeltas);

        // pre-check:
        src.addReference_1_n(dst1);
        equal(dst1.parent, undefined);
        equal(deltas.length, 1);

        const dst2 = LinkTestConcept.create("dst2", handleDeltas);

        // action+check:
        src.removeReference_1_n(dst2);
        equal(deltas.length, 1);
        deepEqual(src.reference_1_n, [dst1]);
    });

});

