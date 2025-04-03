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
    AnnotationMovedFromOtherParentDelta,
    AnnotationMovedInSameParentDelta,
    AnnotationReplacedDelta,
    collectingDeltaHandler
} from "@lionweb/class-core";

import {deepEqual, equal, isUndefined, throws} from "../assertions.js";
import {LinkTestConcept, TestAnnotation} from "../gen/TestLanguage.g.js";


describe("annotations", () => {

    it("getting annotations", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);
        TestAnnotation.create("anno", handleDeltas);
        equal(deltas.length, 0);
        deepEqual(ltc.annotations, []);
    });

    it("adding an annotation", () => {
        // arrange:
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);
        const annotation = TestAnnotation.create("anno", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action:
        ltc.addAnnotation(annotation);

        // assert:
        deepEqual(ltc.annotations, [annotation]);
        equal(annotation.parent, ltc);
        equal(annotation.containment, null);
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new AnnotationAddedDelta(ltc, 0, annotation)
        );
    });

    it("removing an annotation", () => {
        // arrange:
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);
        const annotation = TestAnnotation.create("annotation", handleDeltas);
        ltc.addAnnotation(annotation);

        // pre-check:
        deepEqual(ltc.annotations, [annotation]);
        equal(deltas.length, 1);

        // action:
        ltc.removeAnnotation(annotation);

        // assert:
        equal(ltc.annotations.length, 0);
        equal(annotation.parent, null);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new AnnotationDeletedDelta(ltc, 0, annotation)
        );
    });

    it("inserting an annotation at a specific index", () => {
        // arrange:
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);
        const annotation0 = TestAnnotation.create("annotation0", handleDeltas);
        const annotation1 = TestAnnotation.create("annotation1", handleDeltas);
        ltc.addAnnotation(annotation0);
        ltc.addAnnotation(annotation1);

        // pre-check:
        deepEqual(ltc.annotations, [annotation0, annotation1]);
        equal(deltas.length, 2);

        // action:
        const annotation2 = TestAnnotation.create("annotation2", handleDeltas);
        ltc.insertAnnotationAtIndex(annotation2, 1);

        // assert:
        deepEqual(ltc.annotations, [annotation0, annotation2, annotation1]);
        equal(annotation2.parent, ltc);
        equal(annotation2.containment, null);
        equal(deltas.length, 3);
        deepEqual(
            deltas[2],
            new AnnotationAddedDelta(ltc, 1, annotation2)
        );
    });

    it("inserting an annotation at a wrong index", () => {
        // arrange:
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);
        const annotation = TestAnnotation.create("annotation", handleDeltas);

        // pre-check:
        deepEqual(ltc.annotations, []);
        equal(deltas.length, 0);

        // assert:
        throws(
            () => {
                // action:
                ltc.insertAnnotationAtIndex(annotation, 1);
            },
            `the largest valid insert index for an array with 0 elements is 0, but got: 1`
        );
        throws(
            () => {
                // action:
                ltc.insertAnnotationAtIndex(annotation, -1);
            },
            `an array index must be a non-negative integer, but got: -1`
        );
    });

    it("moving an annotation between parents", () => {
        // arrange:
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const srcLtc = LinkTestConcept.create("srcLtc", handleDeltas);
        const annotation = TestAnnotation.create("annotation", handleDeltas);
        srcLtc.addAnnotation(annotation);
        const dstLtc = LinkTestConcept.create("dstLtc", handleDeltas);

        // pre-check:
        deepEqual(srcLtc.annotations, [annotation]);
        equal(annotation.parent, srcLtc);
        equal(annotation.containment, null);
        deepEqual(dstLtc.annotations, []);
        equal(deltas.length, 1);

        // action:
        dstLtc.addAnnotation(annotation);

        // assert:
        deepEqual(srcLtc.annotations, []);
        deepEqual(dstLtc.annotations, [annotation]);
        equal(annotation.parent, dstLtc);
        equal(annotation.containment, null);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new AnnotationMovedFromOtherParentDelta(srcLtc, 0, dstLtc, 0, annotation)
        );
    });

    it("replacing an annotation", () => {
        // arrange:
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);
        const annotation1 = TestAnnotation.create("annotation1", handleDeltas);
        ltc.addAnnotation(annotation1);
        const annotation2 = TestAnnotation.create("annotation2", handleDeltas);

        // pre-check:
        equal(deltas.length, 1);

        // action:
        ltc.replaceAnnotationAtIndex(annotation2, 0);

        // assert:
        deepEqual(ltc.annotations, [annotation2]);
        isUndefined(annotation1.parent);
        equal(annotation1.containment, null);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new AnnotationReplacedDelta(ltc, 0, annotation1, annotation2)
        );
    });

    it("moving an annotation", () => {
        // arrange:
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);
        const nAnnotations = 7;
        const annotations = [...new Array(nAnnotations).keys()].map((n) => TestAnnotation.create(`annotation-${n}`, handleDeltas))
        annotations.forEach((annotation) => {
            ltc.addAnnotation(annotation)
        });

        // pre-check:
        equal(deltas.length, nAnnotations);

        // action:
        ltc.moveAnnotation(3, 5);

        deepEqual(ltc.annotations, [annotations[0], annotations[1], annotations[2], annotations[4], annotations[5], annotations[3], annotations[6]]);
        equal(deltas.length, nAnnotations + 1);
        deepEqual(
            deltas[deltas.length - 1],
            new AnnotationMovedInSameParentDelta(ltc, 3, 5, annotations[3])
        );
    });

});

