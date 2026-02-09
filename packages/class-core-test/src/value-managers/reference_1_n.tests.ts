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

import { collectingDeltaReceiver, ReferenceAddedDelta, ReferenceDeletedDelta } from "@lionweb/class-core"

import {
    attachedLinkTestConcept,
    integerRange,
    LinkTestConcept,
    TestLanguageBase
} from "@lionweb/class-core-test-language"
import { deepEqual, equal, throws } from "../assertions.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[1..n] reference", () => {

    it("getting an unset [1..n] reference", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const node = LinkTestConcept.create("node", receiveDelta);

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
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dst1 = LinkTestConcept.create("dst1", receiveDelta);
        const src = attachedLinkTestConcept("src", receiveDelta);

        // pre-check:
        equal(deltas.length, 1);

        // action+check:
        src.addReference_1_n(dst1);
        deepEqual(src.reference_1_n, [dst1]);
        equal(dst1.parent, undefined);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ReferenceAddedDelta(src, testLanguageBase.LinkTestConcept_reference_1_n, 0, dst1)
        );

        // action+check:
        const dst2 = LinkTestConcept.create("dst2", receiveDelta);
        src.addReference_1_n(dst2);
        deepEqual(src.reference_1_n, [dst1, dst2]);
        equal(dst2.parent, undefined);
        equal(deltas.length, 3);
        deepEqual(
            deltas[2],
            new ReferenceAddedDelta(src, testLanguageBase.LinkTestConcept_reference_1_n, 1, dst2)
        );
    });

    it("unsetting a [1..n] reference", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dst = LinkTestConcept.create("dst", receiveDelta);
        const src = attachedLinkTestConcept("src", receiveDelta);

        // pre-check:
        src.addReference_1_n(dst);
        equal(dst.parent, undefined);
        equal(deltas.length, 2);

        // action+check:
        throws(
            () => {
                src.removeReference_1_n(dst);
            },
            `can't unset required reference "reference_1_n" on instance of TestLanguage.LinkTestConcept with id=src`
        )
        equal(deltas.length, 2);
    });

    it("remove a target", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dst1 = LinkTestConcept.create("dst1", receiveDelta);
        const dst2 = LinkTestConcept.create("dst2", receiveDelta);
        const dst3 = LinkTestConcept.create("dst3", receiveDelta);
        const src = attachedLinkTestConcept("src", receiveDelta);

        // pre-check:
        src.addReference_1_n(dst1);
        equal(dst1.parent, undefined);
        src.addReference_1_n(dst2);
        equal(dst2.parent, undefined);
        src.addReference_1_n(dst3);
        equal(dst3.parent, undefined);
        equal(deltas.length, 4);

        // action+check:
        src.removeReference_1_n(dst2);
        deepEqual(src.reference_1_n, [dst1, dst3]);
        equal(deltas.length, 5);
        deepEqual(
            deltas[4],
            new ReferenceDeletedDelta(src, testLanguageBase.LinkTestConcept_reference_1_n, 1, dst2)
        );
    });

    it("trying to remove a target that wasn't in there", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dst1 = LinkTestConcept.create("dst1", receiveDelta);
        const src = attachedLinkTestConcept("src", receiveDelta);

        // pre-check:
        src.addReference_1_n(dst1);
        equal(dst1.parent, undefined);
        equal(deltas.length, 2);

        const dst2 = LinkTestConcept.create("dst2", receiveDelta);

        // action+check:
        src.removeReference_1_n(dst2);
        equal(deltas.length, 2);
        deepEqual(src.reference_1_n, [dst1]);
    });

    it("moving a reference around", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const parent = attachedLinkTestConcept("parent", receiveDelta);
        const nChildren = 5
        const children = integerRange(nChildren).map((i) => LinkTestConcept.create(`child${i}`, receiveDelta));
        const child = (i: number) => children[i];
        children.forEach((child) => {
            parent.addReference_1_n(child);
        });

        // pre-check:
        equal(deltas.length, 1 + nChildren);

        // action1+check:
        parent.moveReference_1_n(1, 3);
        deepEqual(parent.reference_1_n, [0, 2, 3, 1, 4].map(child));
        equal(deltas.length, nChildren + 3);
        deepEqual(
            deltas[nChildren + 1],
            new ReferenceDeletedDelta(parent, testLanguageBase.LinkTestConcept_reference_1_n, 1, child(1))
        );
        deepEqual(
            deltas[nChildren + 2],
            new ReferenceAddedDelta(parent, testLanguageBase.LinkTestConcept_reference_1_n, 2, child(1))
        );

        // action2+check:
        parent.moveReference_1_n(3, 1);
        deepEqual(parent.reference_1_n, [0, 1, 2, 3, 4].map(child));
        equal(deltas.length, nChildren + 5);
        deepEqual(
            deltas[nChildren + 3],
            new ReferenceDeletedDelta(parent, testLanguageBase.LinkTestConcept_reference_1_n, 3, child(1))
        );
        deepEqual(
            deltas[nChildren + 4],
            new ReferenceAddedDelta(parent, testLanguageBase.LinkTestConcept_reference_1_n, 1, child(1))
        );

        // action3+check:
        parent.moveReference_1_n(2, 2);
        deepEqual(parent.reference_1_n, [0, 1, 2, 3, 4].map(child));
        equal(deltas.length, nChildren + 5);
    });

});

