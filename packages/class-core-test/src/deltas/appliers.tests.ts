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
    ChildMovedFromOtherContainmentDelta,
    ChildReplacedDelta
} from "@lionweb/class-core"

import { LinkTestConcept, TestAnnotation, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isUndefined } from "../assertions.js"

const testLanguage = TestLanguageBase.INSTANCE

describe("delta application sets parentage correctly", () => {

    it("child added", () => {
        [
            testLanguage.LinkTestConcept_containment_0_1,
            testLanguage.LinkTestConcept_containment_1,
            testLanguage.LinkTestConcept_containment_0_n,
            testLanguage.LinkTestConcept_containment_1_n
        ].forEach((containment) => {
            const parent = LinkTestConcept.create("parent");
            const child = LinkTestConcept.create("child");
            const delta = new ChildAddedDelta(parent, containment, 0, child);

            applyDelta(delta);

            equal(child.parent, parent);
        });
    });

    it("child moved", () => {
        const parent = LinkTestConcept.create("parent");
        const child = LinkTestConcept.create("child");
        parent.containment_0_1 = child;
        const dstLtc = LinkTestConcept.create("dstLtc");
        const delta = new ChildMovedFromOtherContainmentDelta(parent, testLanguage.LinkTestConcept_containment_0_1, 0, dstLtc, testLanguage.LinkTestConcept_containment_0_1, 0, child);

        applyDelta(delta);

        equal(child.parent, dstLtc);
        isUndefined(parent.containment_0_1);
    });

    it("child replaced", () => {
        const srcParent = LinkTestConcept.create("srcParent");
        const child1 = LinkTestConcept.create("child1");
        srcParent.containment_0_1 = child1;
        const dstParent = LinkTestConcept.create("dstParent");
        const child2 = LinkTestConcept.create("child2");
        dstParent.containment_0_1 = child2;
        const delta = new ChildReplacedDelta(dstParent, testLanguage.LinkTestConcept_containment_0_1, 0, child2, child1);

        applyDelta(delta);

        equal(child1.parent, dstParent);
        isUndefined(child2.parent);
    });

    it("child deleted", () => {
        const parent = LinkTestConcept.create("parent");
        const child = LinkTestConcept.create("child");
        parent.containment_0_1 = child;
        const delta = new ChildDeletedDelta(parent, testLanguage.LinkTestConcept_containment_0_1, 0, child);

        applyDelta(delta);

        isUndefined(child.parent);
        isUndefined(parent.containment_0_1);
    });

    it("annotation added", () => {
        const node = LinkTestConcept.create("node");
        const annotation = TestAnnotation.create("anno");
        const delta = new AnnotationAddedDelta(node, 0, annotation);

        applyDelta(delta);

        equal(annotation.parent, node);
        deepEqual(node.annotations, [annotation]);
    });

    it("annotation deleted", () => {
        const node = LinkTestConcept.create("node");
        const annotation = TestAnnotation.create("anno");
        node.addAnnotation(annotation);
        const delta = new AnnotationDeletedDelta(node, 0, annotation);

        applyDelta(delta);

        isUndefined(annotation.parent);
        deepEqual(node.annotations, []);
    });

});

