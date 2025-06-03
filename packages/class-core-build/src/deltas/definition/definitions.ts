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

import { defineDelta, index, node, parentage, primitiveValue, refOnly, serializeSubTreeAs } from "./definition-base.js"
import { FeatureKinds } from "./Deltas.g.js"

export const defineDeltas = () => {
    defineDelta("NoOp", [], "Delta that does nothing.\nWarning: should only be used for development purposes!")

    defineDelta("PropertyAdded", [...parentage("container", "property", FeatureKinds.property), primitiveValue("value")])

    defineDelta("PropertyDeleted", [...parentage("container", "property", FeatureKinds.property), primitiveValue("oldValue")])

    defineDelta("PropertyChanged", [
        ...parentage("container", "property", FeatureKinds.property),
        primitiveValue("oldValue"),
        primitiveValue("newValue")
    ])

    // Note:Each link-related ∂'s fields typically start with [parent, link, index]

    defineDelta("ChildAdded", [
        ...parentage("parent", "containment", FeatureKinds.containment),
        index("index"),
        node("newChild", serializeSubTreeAs("newNodes"))
    ])

    defineDelta("ChildDeleted", [
        ...parentage("parent", "containment", FeatureKinds.containment),
        index("index"),
        node("deletedChild", serializeSubTreeAs("deletedNodes"))
    ])

    defineDelta("ChildReplaced", [
        ...parentage("parent", "containment", FeatureKinds.containment),
        index("index"),
        node("replacedChild", serializeSubTreeAs("replacedNodes")),
        node("newChild", serializeSubTreeAs("newNodes"))
    ])

    defineDelta("ChildMoved", [
        ...parentage("oldParent", "oldContainment", FeatureKinds.containment),
        index("oldIndex"),
        ...parentage("newParent", "newContainment", FeatureKinds.containment),
        index("newIndex"),
        node("child")
    ])

    defineDelta("ChildMovedInSameContainment", [
        ...parentage("parent", "containment", FeatureKinds.containment),
        index("oldIndex"),
        index("newIndex"),
        node("child")
    ])

    defineDelta("ReferenceAdded", [
        ...parentage("container", "reference", FeatureKinds.reference),
        index("index"),
        node("newTarget", refOnly())
    ])

    defineDelta("ReferenceDeleted", [
        ...parentage("container", "reference", FeatureKinds.reference),
        index("index"),
        node("deletedTarget", refOnly())
    ])

    defineDelta(
        "ReferenceReplaced",
        [
            ...parentage("container", "reference", FeatureKinds.reference),
            index("index"),
            node("replacedTarget", refOnly()),
            node("newTarget", refOnly())
        ],
        `Note: corresponds to "reference changed" in delta proposal!`
    )

    defineDelta(
        "ReferenceMoved",
        [
            ...parentage("oldContainer", "oldReference", FeatureKinds.reference),
            index("oldIndex"),
            ...parentage("newContainer", "newReference", FeatureKinds.reference),
            index("newIndex"),
            node("target", refOnly())
        ],
        `Note: corresponds to "entry moved from other reference" in delta proposal!`
    )

    defineDelta("ReferenceMovedInSameReference", [
        ...parentage("container", "reference", FeatureKinds.reference),
        index("oldIndex"),
        index("newIndex"),
        node("target", refOnly())
    ])

    defineDelta("AnnotationAdded", [node("parent"), index("index"), node("newAnnotation", serializeSubTreeAs("newAnnotationNodes"))])

    defineDelta("AnnotationDeleted", [
        node("parent"),
        index("index"),
        node("deletedAnnotation", serializeSubTreeAs("deletedAnnotationNodes"))
    ])

    defineDelta("AnnotationReplaced", [
        node("parent"),
        index("index"),
        node("replacedAnnotation", serializeSubTreeAs("replacedAnnotationNodes")),
        node("newAnnotation", serializeSubTreeAs("newAnnotationNodes"))
    ])

    defineDelta("AnnotationMovedFromOtherParent", [
        node("oldParent"),
        index("oldIndex"),
        node("newParent"),
        index("newIndex"),
        node("movedAnnotation")
    ])

    defineDelta("AnnotationMovedInSameParent", [node("parent"), index("oldIndex"), index("newIndex"), node("movedAnnotation")])
}

