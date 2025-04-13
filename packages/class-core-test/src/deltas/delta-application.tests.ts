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

import {
    AnnotationAddedDelta,
    AnnotationDeletedDelta,
    applyDelta,
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedDelta,
    ChildReplacedDelta
} from "@lionweb/class-core"
import { deepEqual, equal, isUndefined } from "../assertions.js"

import { DatatypeTestConcept, LinkTestConcept, TestAnnotation, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguage = TestLanguageBase.INSTANCE

describe("delta application sets parentage correctly", () => {

    it("child added", () => {
        [
            testLanguage.LinkTestConcept_containment_0_1,
            testLanguage.LinkTestConcept_containment_1,
            testLanguage.LinkTestConcept_containment_0_n,
            testLanguage.LinkTestConcept_containment_1_n
        ].forEach((containment) => {
            const ltc = LinkTestConcept.create("ltc");
            const dtc = DatatypeTestConcept.create("dtc");
            const delta = new ChildAddedDelta(ltc, containment, 0, dtc);

            applyDelta(delta);

            equal(dtc.parent, ltc);
        });
    });

    it("child moved", () => {
        const srcLtc = LinkTestConcept.create("srcLtc");
        const dtc = DatatypeTestConcept.create("dtc");
        srcLtc.containment_0_1 = dtc;
        const dstLtc = LinkTestConcept.create("dstLtc");
        const delta = new ChildMovedDelta(srcLtc, testLanguage.LinkTestConcept_containment_0_1, 0, dstLtc, testLanguage.LinkTestConcept_containment_0_1, 0, dtc);

        applyDelta(delta);

        equal(dtc.parent, dstLtc);
        isUndefined(srcLtc.containment_0_1);
    });

    it("child replaced", () => {
        const srcLtc = LinkTestConcept.create("srcLtc");
        const dtc1 = DatatypeTestConcept.create("dtc1");
        srcLtc.containment_0_1 = dtc1;
        const dstLtc = LinkTestConcept.create("dstLtc");
        const dtc2 = DatatypeTestConcept.create("dtc2");
        dstLtc.containment_0_1 = dtc2;
        const delta = new ChildReplacedDelta(dstLtc, testLanguage.LinkTestConcept_containment_0_1, 0, dtc2, dtc1);

        applyDelta(delta);

        equal(dtc1.parent, dstLtc);
        isUndefined(dtc2.parent);
    });

    it("child deleted", () => {
        const ltc = LinkTestConcept.create("ltc");
        const dtc = DatatypeTestConcept.create("dtc");
        ltc.containment_0_1 = dtc;
        const delta = new ChildDeletedDelta(ltc, testLanguage.LinkTestConcept_containment_0_1, 0, dtc);

        applyDelta(delta);

        isUndefined(dtc.parent);
        isUndefined(ltc.containment_0_1);
    });

    it("annotation added", () => {
        const ltc = LinkTestConcept.create("ltc");
        const annotation = TestAnnotation.create("anno");
        const delta = new AnnotationAddedDelta(ltc, 0, annotation);

        applyDelta(delta);

        equal(annotation.parent, ltc);
        deepEqual(ltc.annotations, [annotation]);
    });

    it("annotation deleted", () => {
        const ltc = LinkTestConcept.create("ltc");
        const annotation = TestAnnotation.create("anno");
        ltc.addAnnotation(annotation);
        const delta = new AnnotationDeletedDelta(ltc, 0, annotation);

        applyDelta(delta);

        isUndefined(annotation.parent);
        deepEqual(ltc.annotations, []);
    });

});

