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
import { DatatypeTestConcept, LinkTestConcept, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[1..n] reference", () => {

    it("getting an unset [1..n] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        throws(
            () => {
                deepEqual(ltc.reference_1_n, []);
            },
            `can't read required reference "reference_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=ltc`
        );
        equal(deltas.length, 0);
    });

    it("adding to a [1..n] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        ltc.addReference_1_n(dtc1);
        deepEqual(ltc.reference_1_n, [dtc1]);
        equal(dtc1.parent, undefined);
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new ReferenceAddedDelta(ltc, testLanguageBase.LinkTestConcept_reference_1_n, 0, dtc1)
        );

        // action+check:
        const dtc2 = DatatypeTestConcept.create("dtc2", handleDeltas);
        ltc.addReference_1_n(dtc2);
        deepEqual(ltc.reference_1_n, [dtc1, dtc2]);
        equal(dtc2.parent, undefined);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ReferenceAddedDelta(ltc, testLanguageBase.LinkTestConcept_reference_1_n, 1, dtc2)
        );
    });

    it("unsetting a [1..n] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc = DatatypeTestConcept.create("dtc", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.addReference_1_n(dtc);
        equal(dtc.parent, undefined);
        equal(deltas.length, 1);

        // action+check:
        throws(
            () => {
                ltc.removeReference_1_n(dtc);
            },
            `can't unset required reference "reference_1_n" on instance of TestLanguage.LinkTestConcept with id=ltc`
        )
        equal(deltas.length, 1);
    });

    it("remove a target", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDeltas);
        const dtc2 = DatatypeTestConcept.create("dtc2", handleDeltas);
        const dtc3 = DatatypeTestConcept.create("dtc3", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.addReference_1_n(dtc1);
        equal(dtc1.parent, undefined);
        ltc.addReference_1_n(dtc2);
        equal(dtc2.parent, undefined);
        ltc.addReference_1_n(dtc3);
        equal(dtc3.parent, undefined);
        equal(deltas.length, 3);

        // action+check:
        ltc.removeReference_1_n(dtc2);
        deepEqual(ltc.reference_1_n, [dtc1, dtc3]);
        equal(deltas.length, 4);
        deepEqual(
            deltas[3],
            new ReferenceDeletedDelta(ltc, testLanguageBase.LinkTestConcept_reference_1_n, 1, dtc2)
        );
    });

    it("trying to remove a target that wasn't in there", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.addReference_1_n(dtc1);
        equal(dtc1.parent, undefined);
        equal(deltas.length, 1);

        const dtc2 = DatatypeTestConcept.create("dtc2", handleDeltas);

        // action+check:
        ltc.removeReference_1_n(dtc2);
        equal(deltas.length, 1);
        deepEqual(ltc.reference_1_n, [dtc1]);
    });

});

