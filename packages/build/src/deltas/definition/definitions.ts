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

import { FeatureKinds } from "./Deltas.g.js"
import {
    customField,
    defineDelta,
    feature,
    index,
    node,
    parentage,
    primitiveValue,
    refOnly,
    serializeSubTreeAs
} from "./definition-base.js"


export const defineDeltas = () => {

    // TODO  consider compounding the delta's name, e.g.: noun-verb style so we can derive past tense and such

    /* ~ § 5.7.1.1 */
    defineDelta(
        "PartitionAdded",
        [
            node("newPartition", serializeSubTreeAs("newNodes"))
        ]
    )

    /* ~ § 5.7.1.2 */
    defineDelta(
        "PartitionDeleted",
        [
            node("deletedPartition")
        ]
    )

    /*
     * Note: no delta counterpart for the ClassifierChanged event exists because no API exists to cause such a delta.
     */

    /* ~ § 5.7.3.3 */
    defineDelta(
        "PropertyAdded",
        [
            ...parentage("node", "property", FeatureKinds.property),
            primitiveValue("value")
        ]
    )

    /* ~ § 5.7.3.2 */
    defineDelta(
        "PropertyDeleted",
        [
            ...parentage("node", "property", FeatureKinds.property),
            primitiveValue("oldValue")
        ]
    )

    /* ~ § 5.7.3.3 */
    defineDelta(
        "PropertyChanged",
        [
            ...parentage("node", "property", FeatureKinds.property),
            primitiveValue("oldValue"),
            primitiveValue("newValue")
        ]
    )

    // Note:Each link-related ∂'s fields typically start with [parent, link, index]

    /* ~ § 5.7.4.1 */
    defineDelta(
        "ChildAdded",
        [
            ...parentage("parent", "containment", FeatureKinds.containment),
            index("index"),
            node("newChild", serializeSubTreeAs("newNodes"))
        ]
    )

    /* ~ § 5.7.4.2 */
    defineDelta(
        "ChildDeleted",
        [
            ...parentage("parent", "containment", FeatureKinds.containment),
            index("index"),
            node("deletedChild", serializeSubTreeAs("deletedNodes"))
        ]
    )

    /* ~ § 5.7.4.3 */
    defineDelta(
        "ChildReplaced",
        [
            ...parentage("parent", "containment", FeatureKinds.containment),
            index("index"),
            node("replacedChild", serializeSubTreeAs("replacedNodes")),
            node("newChild", serializeSubTreeAs("newNodes"))
        ]
    )

    /* ~ § 5.7.4.4 */
    defineDelta(
        "ChildMovedFromOtherContainment",
        [
            ...parentage("oldParent", "oldContainment", FeatureKinds.containment),
            index("oldIndex"),
            ...parentage("newParent", "newContainment", FeatureKinds.containment),
            index("newIndex"),
            node("movedChild")
        ],
    )

    /* ~ § 5.7.4.5 */
    {
        const origin = parentage("parent", "oldContainment", FeatureKinds.containment)
        defineDelta(
            "ChildMovedFromOtherContainmentInSameParent",
            [
                ...origin,
                index("oldIndex"),
                node("movedChild"),
                feature("newContainment", FeatureKinds.containment, origin[0]),
                index("newIndex"),
            ]
        )
    }

    /* ~ § 5.7.4.6 */
    defineDelta(
        "ChildMovedInSameContainment",
        [
            ...parentage("parent", "containment", FeatureKinds.containment),
            index("oldIndex"),
            index("newIndex"),
            node("movedChild")
        ]
    )

    /* ~ § 5.7.4.7 */
    defineDelta(
        "ChildMovedAndReplacedFromOtherContainment",
        [
            ...parentage("newParent", "newContainment", FeatureKinds.containment),
            index("newIndex"),
            node("movedChild"),
            ...parentage("oldParent", "oldContainment", FeatureKinds.containment),
            index("oldIndex"),
            node("replacedChild", serializeSubTreeAs("replacedChildAsNodes"))
        ]
    )

    /* ~ § 5.7.4.8 */
    {
        const origin = parentage("parent", "oldContainment", FeatureKinds.containment)
        defineDelta(
            "ChildMovedAndReplacedFromOtherContainmentInSameParent",
            [
                ...origin,
                index("oldIndex"),
                feature("newContainment", FeatureKinds.containment, origin[0]),
                index("newIndex"),
                node("movedChild"),
                node("replacedChild", serializeSubTreeAs("replacedChildAsNodes"))
            ]
        )
    }

    /* ~ § 5.7.6.4.9 */
    defineDelta(
        "ChildMovedAndReplacedInSameContainment",
        [
            ...parentage("parent", "containment", FeatureKinds.containment),
            index("oldIndex"),
            index("newIndex"),
            node("movedChild"),
            node("replacedChild", serializeSubTreeAs("replacedChildAsNodes"))
        ]
    )

    /* ~ § 5.7.5.1 */
    defineDelta(
        "AnnotationAdded",
        [
            node("parent"),
            index("index"),
            node("newAnnotation", serializeSubTreeAs("newAnnotationNodes"))
        ]
    )

    /* ~ § 5.7.5.2 */
    defineDelta(
        "AnnotationDeleted",
        [
            node("parent"),
            index("index"),
            node("deletedAnnotation", serializeSubTreeAs("deletedAnnotationNodes"))
        ]
    )

    /* ~ § 5.7.5.3 */
    defineDelta(
        "AnnotationReplaced",
        [
            node("parent"),
            index("index"),
            node("replacedAnnotation", serializeSubTreeAs("replacedAnnotationNodes")),
            node("newAnnotation", serializeSubTreeAs("newAnnotationNodes"))
        ]
    )

    /* ~ § 5.7.5.4 */
    defineDelta(
        "AnnotationMovedFromOtherParent",
        [
            node("oldParent"),
            index("oldIndex"),
            node("newParent"),
            index("newIndex"),
            node("movedAnnotation")
        ]
    )

    /* ~ § 5.7.5.5 */
    defineDelta(
        "AnnotationMovedInSameParent",
        [
            node("parent"),
            index("oldIndex"),
            index("newIndex"),
            node("movedAnnotation")
        ]
    )

    /* ~ § 5.7.5.6 */
    defineDelta(
        "AnnotationMovedAndReplacedFromOtherParent",
        [
            node("oldParent"),
            index("oldIndex"),
            node("replacedAnnotation", serializeSubTreeAs("replacedAnnotationNodes")),
            node("newParent"),
            index("newIndex"),
            node("movedAnnotation")
        ]
    )

    /* ~ § 5.7.5.7 */
    defineDelta(
        "AnnotationMovedAndReplacedInSameParent",
        [
            node("parent"),
            index("oldIndex"),
            index("newIndex"),
            node("replacedAnnotation", serializeSubTreeAs("replacedAnnotationNodes")),
            node("movedAnnotation")
        ]
    )

    /* ~ § 5.7.6.1 */
    defineDelta(
        "ReferenceAdded",
        [
            ...parentage("parent", "reference", FeatureKinds.reference),
            index("index"),
            node("newReference", refOnly())
        ]
    )

    /* ~ § 5.7.6.2 */
    defineDelta(
        "ReferenceDeleted",
        [
            ...parentage("parent", "reference", FeatureKinds.reference),
            index("index"),
            node("deletedReference", refOnly())
        ]
    )

    /* ~ § 5.7.6.3 */
    defineDelta(
        "ReferenceChanged",
        [
            ...parentage("parent", "reference", FeatureKinds.reference),
            index("index"),
            node("newReference", refOnly()),
            node("oldReference", refOnly())
        ]
    )

    /*
     * The following events don't have a delta counterpart because no API exists to cause such deltas:
     *
     *      Reference{ResolveInfo|Target}{Added|Deleted|Changed}
     */

    /* ~ § 5.7.7.1 */
    defineDelta(
        "Composite",
        [
            customField(
                "parts",
                "IDelta[]",
                "SerializedDelta[]",
                "delta.parts.map(serializeDelta)",
                "delta.parts.map(deserializedDelta)"
            )
        ]
    )

    /* ~ § 5.7.7.2 */
    defineDelta("NoOp", [], "Delta that does nothing.")

    // Note: no delta is equivalent to ErrorEvent.

}

