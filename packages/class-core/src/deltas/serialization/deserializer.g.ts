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

// Warning: this file is generated!
// Modifying it by hand is useless at best, and sabotage at worst.

import { featureResolversFor } from "@lionweb/core";
import { ILanguageBase } from "../../base-types.js";
import { IDelta } from "../base.js";
import { IdMapping } from "../../id-mapping.js";
import { SerializedDelta } from "./types.g.js";
import { DeltaDeserializer } from "./base.js";
import {
    AnnotationAddedDelta,
    AnnotationDeletedDelta,
    AnnotationMovedAndReplacedFromOtherParentDelta,
    AnnotationMovedAndReplacedInSameParentDelta,
    AnnotationMovedFromOtherParentDelta,
    AnnotationMovedInSameParentDelta,
    AnnotationReplacedDelta,
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedAndReplacedFromOtherContainmentDelta,
    ChildMovedAndReplacedFromOtherContainmentInSameParentDelta,
    ChildMovedAndReplacedInSameContainmentDelta,
    ChildMovedFromOtherContainmentDelta,
    ChildMovedFromOtherContainmentInSameParentDelta,
    ChildMovedInSameContainmentDelta,
    ChildReplacedDelta,
    CompositeDelta,
    EntryMovedAndReplacedFromOtherReferenceDelta,
    EntryMovedAndReplacedFromOtherReferenceInSameParentDelta,
    EntryMovedAndReplacedInSameReferenceDelta,
    EntryMovedFromOtherReferenceDelta,
    EntryMovedFromOtherReferenceInSameParentDelta,
    EntryMovedInSameReferenceDelta,
    NoOpDelta,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceChangedDelta,
    ReferenceDeletedDelta
} from "../types.g.js";


export const deltaDeserializer = (languageBases: ILanguageBase[], idMapping: IdMapping): DeltaDeserializer => {
    const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolversFor(languageBases.map(({language}) => language));
    const deserializedDelta = (delta: SerializedDelta): IDelta => {
        switch (delta.kind) {
            case "PartitionAdded": {
                const newPartition = idMapping.fromId(delta.newPartition);
                return new PartitionAddedDelta(newPartition);
            }
            case "PartitionDeleted": {
                const deletedPartition = idMapping.fromId(delta.deletedPartition);
                return new PartitionDeletedDelta(deletedPartition);
            }
            case "PropertyAdded": {
                const node = idMapping.fromId(delta.node);
                const property = resolvedPropertyFrom(delta.property, node.classifier);
                const value = delta.value;
                return new PropertyAddedDelta(node, property, value);
            }
            case "PropertyDeleted": {
                const node = idMapping.fromId(delta.node);
                const property = resolvedPropertyFrom(delta.property, node.classifier);
                const oldValue = delta.oldValue;
                return new PropertyDeletedDelta(node, property, oldValue);
            }
            case "PropertyChanged": {
                const node = idMapping.fromId(delta.node);
                const property = resolvedPropertyFrom(delta.property, node.classifier);
                const oldValue = delta.oldValue;
                const newValue = delta.newValue;
                return new PropertyChangedDelta(node, property, oldValue, newValue);
            }
            case "ChildAdded": {
                const parent = idMapping.fromId(delta.parent);
                const containment = resolvedContainmentFrom(delta.containment, parent.classifier);
                const index = delta.index;
                const newChild = idMapping.fromId(delta.newChild);
                return new ChildAddedDelta(parent, containment, index, newChild);
            }
            case "ChildDeleted": {
                const parent = idMapping.fromId(delta.parent);
                const containment = resolvedContainmentFrom(delta.containment, parent.classifier);
                const index = delta.index;
                const deletedChild = idMapping.fromId(delta.deletedChild);
                return new ChildDeletedDelta(parent, containment, index, deletedChild);
            }
            case "ChildReplaced": {
                const parent = idMapping.fromId(delta.parent);
                const containment = resolvedContainmentFrom(delta.containment, parent.classifier);
                const index = delta.index;
                const replacedChild = idMapping.fromId(delta.replacedChild);
                const newChild = idMapping.fromId(delta.newChild);
                return new ChildReplacedDelta(parent, containment, index, replacedChild, newChild);
            }
            case "ChildMovedFromOtherContainment": {
                const oldParent = idMapping.fromId(delta.oldParent);
                const oldContainment = resolvedContainmentFrom(delta.oldContainment, oldParent.classifier);
                const oldIndex = delta.oldIndex;
                const newParent = idMapping.fromId(delta.newParent);
                const newContainment = resolvedContainmentFrom(delta.newContainment, newParent.classifier);
                const newIndex = delta.newIndex;
                const movedChild = idMapping.fromId(delta.movedChild);
                return new ChildMovedFromOtherContainmentDelta(oldParent, oldContainment, oldIndex, newParent, newContainment, newIndex, movedChild);
            }
            case "ChildMovedFromOtherContainmentInSameParent": {
                const parent = idMapping.fromId(delta.parent);
                const oldContainment = resolvedContainmentFrom(delta.oldContainment, parent.classifier);
                const oldIndex = delta.oldIndex;
                const movedChild = idMapping.fromId(delta.movedChild);
                const newContainment = resolvedContainmentFrom(delta.newContainment, parent.classifier);
                const newIndex = delta.newIndex;
                return new ChildMovedFromOtherContainmentInSameParentDelta(parent, oldContainment, oldIndex, movedChild, newContainment, newIndex);
            }
            case "ChildMovedInSameContainment": {
                const parent = idMapping.fromId(delta.parent);
                const containment = resolvedContainmentFrom(delta.containment, parent.classifier);
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const movedChild = idMapping.fromId(delta.movedChild);
                return new ChildMovedInSameContainmentDelta(parent, containment, oldIndex, newIndex, movedChild);
            }
            case "ChildMovedAndReplacedFromOtherContainment": {
                const newParent = idMapping.fromId(delta.newParent);
                const newContainment = resolvedContainmentFrom(delta.newContainment, newParent.classifier);
                const newIndex = delta.newIndex;
                const movedChild = idMapping.fromId(delta.movedChild);
                const oldParent = idMapping.fromId(delta.oldParent);
                const oldContainment = resolvedContainmentFrom(delta.oldContainment, oldParent.classifier);
                const oldIndex = delta.oldIndex;
                const replacedChild = idMapping.fromId(delta.replacedChild);
                return new ChildMovedAndReplacedFromOtherContainmentDelta(newParent, newContainment, newIndex, movedChild, oldParent, oldContainment, oldIndex, replacedChild);
            }
            case "ChildMovedAndReplacedFromOtherContainmentInSameParent": {
                const parent = idMapping.fromId(delta.parent);
                const oldContainment = resolvedContainmentFrom(delta.oldContainment, parent.classifier);
                const oldIndex = delta.oldIndex;
                const newContainment = resolvedContainmentFrom(delta.newContainment, parent.classifier);
                const newIndex = delta.newIndex;
                const movedChild = idMapping.fromId(delta.movedChild);
                const replacedChild = idMapping.fromId(delta.replacedChild);
                return new ChildMovedAndReplacedFromOtherContainmentInSameParentDelta(parent, oldContainment, oldIndex, newContainment, newIndex, movedChild, replacedChild);
            }
            case "ChildMovedAndReplacedInSameContainment": {
                const parent = idMapping.fromId(delta.parent);
                const containment = resolvedContainmentFrom(delta.containment, parent.classifier);
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const movedChild = idMapping.fromId(delta.movedChild);
                const replacedChild = idMapping.fromId(delta.replacedChild);
                return new ChildMovedAndReplacedInSameContainmentDelta(parent, containment, oldIndex, newIndex, movedChild, replacedChild);
            }
            case "AnnotationAdded": {
                const parent = idMapping.fromId(delta.parent);
                const index = delta.index;
                const newAnnotation = idMapping.fromId(delta.newAnnotation);
                return new AnnotationAddedDelta(parent, index, newAnnotation);
            }
            case "AnnotationDeleted": {
                const parent = idMapping.fromId(delta.parent);
                const index = delta.index;
                const deletedAnnotation = idMapping.fromId(delta.deletedAnnotation);
                return new AnnotationDeletedDelta(parent, index, deletedAnnotation);
            }
            case "AnnotationReplaced": {
                const parent = idMapping.fromId(delta.parent);
                const index = delta.index;
                const replacedAnnotation = idMapping.fromId(delta.replacedAnnotation);
                const newAnnotation = idMapping.fromId(delta.newAnnotation);
                return new AnnotationReplacedDelta(parent, index, replacedAnnotation, newAnnotation);
            }
            case "AnnotationMovedFromOtherParent": {
                const oldParent = idMapping.fromId(delta.oldParent);
                const oldIndex = delta.oldIndex;
                const newParent = idMapping.fromId(delta.newParent);
                const newIndex = delta.newIndex;
                const movedAnnotation = idMapping.fromId(delta.movedAnnotation);
                return new AnnotationMovedFromOtherParentDelta(oldParent, oldIndex, newParent, newIndex, movedAnnotation);
            }
            case "AnnotationMovedInSameParent": {
                const parent = idMapping.fromId(delta.parent);
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const movedAnnotation = idMapping.fromId(delta.movedAnnotation);
                return new AnnotationMovedInSameParentDelta(parent, oldIndex, newIndex, movedAnnotation);
            }
            case "AnnotationMovedAndReplacedFromOtherParent": {
                const oldParent = idMapping.fromId(delta.oldParent);
                const oldIndex = delta.oldIndex;
                const replacedAnnotation = idMapping.fromId(delta.replacedAnnotation);
                const newParent = idMapping.fromId(delta.newParent);
                const newIndex = delta.newIndex;
                const movedAnnotation = idMapping.fromId(delta.movedAnnotation);
                return new AnnotationMovedAndReplacedFromOtherParentDelta(oldParent, oldIndex, replacedAnnotation, newParent, newIndex, movedAnnotation);
            }
            case "AnnotationMovedAndReplacedInSameParent": {
                const parent = idMapping.fromId(delta.parent);
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const replacedAnnotation = idMapping.fromId(delta.replacedAnnotation);
                const movedAnnotation = idMapping.fromId(delta.movedAnnotation);
                return new AnnotationMovedAndReplacedInSameParentDelta(parent, oldIndex, newIndex, replacedAnnotation, movedAnnotation);
            }
            case "ReferenceAdded": {
                const parent = idMapping.fromId(delta.parent);
                const reference = resolvedReferenceFrom(delta.reference, parent.classifier);
                const index = delta.index;
                const newTarget = idMapping.fromRefId(delta.newTarget);
                return new ReferenceAddedDelta(parent, reference, index, newTarget);
            }
            case "ReferenceDeleted": {
                const parent = idMapping.fromId(delta.parent);
                const reference = resolvedReferenceFrom(delta.reference, parent.classifier);
                const index = delta.index;
                const deletedTarget = idMapping.fromRefId(delta.deletedTarget);
                return new ReferenceDeletedDelta(parent, reference, index, deletedTarget);
            }
            case "ReferenceChanged": {
                const parent = idMapping.fromId(delta.parent);
                const reference = resolvedReferenceFrom(delta.reference, parent.classifier);
                const index = delta.index;
                const newTarget = idMapping.fromRefId(delta.newTarget);
                const oldTarget = idMapping.fromRefId(delta.oldTarget);
                return new ReferenceChangedDelta(parent, reference, index, newTarget, oldTarget);
            }
            case "EntryMovedFromOtherReference": {
                const oldParent = idMapping.fromId(delta.oldParent);
                const oldReference = resolvedReferenceFrom(delta.oldReference, oldParent.classifier);
                const oldIndex = delta.oldIndex;
                const newParent = idMapping.fromId(delta.newParent);
                const newReference = resolvedReferenceFrom(delta.newReference, newParent.classifier);
                const newIndex = delta.newIndex;
                const movedTarget = idMapping.fromRefId(delta.movedTarget);
                return new EntryMovedFromOtherReferenceDelta(oldParent, oldReference, oldIndex, newParent, newReference, newIndex, movedTarget);
            }
            case "EntryMovedFromOtherReferenceInSameParent": {
                const parent = idMapping.fromId(delta.parent);
                const oldReference = resolvedReferenceFrom(delta.oldReference, parent.classifier);
                const oldIndex = delta.oldIndex;
                const newReference = resolvedReferenceFrom(delta.newReference, parent.classifier);
                const newIndex = delta.newIndex;
                const movedTarget = idMapping.fromRefId(delta.movedTarget);
                return new EntryMovedFromOtherReferenceInSameParentDelta(parent, oldReference, oldIndex, newReference, newIndex, movedTarget);
            }
            case "EntryMovedInSameReference": {
                const parent = idMapping.fromId(delta.parent);
                const reference = resolvedReferenceFrom(delta.reference, parent.classifier);
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const movedTarget = idMapping.fromRefId(delta.movedTarget);
                return new EntryMovedInSameReferenceDelta(parent, reference, oldIndex, newIndex, movedTarget);
            }
            case "EntryMovedAndReplacedFromOtherReference": {
                const newParent = idMapping.fromId(delta.newParent);
                const newReference = resolvedReferenceFrom(delta.newReference, newParent.classifier);
                const newIndex = delta.newIndex;
                const movedTarget = idMapping.fromRefId(delta.movedTarget);
                const oldParent = idMapping.fromId(delta.oldParent);
                const oldReference = resolvedReferenceFrom(delta.oldReference, oldParent.classifier);
                const oldIndex = delta.oldIndex;
                const replacedTarget = idMapping.fromRefId(delta.replacedTarget);
                return new EntryMovedAndReplacedFromOtherReferenceDelta(newParent, newReference, newIndex, movedTarget, oldParent, oldReference, oldIndex, replacedTarget);
            }
            case "EntryMovedAndReplacedFromOtherReferenceInSameParent": {
                const parent = idMapping.fromId(delta.parent);
                const oldReference = resolvedReferenceFrom(delta.oldReference, parent.classifier);
                const oldIndex = delta.oldIndex;
                const newReference = resolvedReferenceFrom(delta.newReference, parent.classifier);
                const newIndex = delta.newIndex;
                const movedTarget = idMapping.fromRefId(delta.movedTarget);
                const replacedTarget = idMapping.fromRefId(delta.replacedTarget);
                return new EntryMovedAndReplacedFromOtherReferenceInSameParentDelta(parent, oldReference, oldIndex, newReference, newIndex, movedTarget, replacedTarget);
            }
            case "EntryMovedAndReplacedInSameReference": {
                const parent = idMapping.fromId(delta.parent);
                const reference = resolvedReferenceFrom(delta.reference, parent.classifier);
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const movedTarget = idMapping.fromRefId(delta.movedTarget);
                const replacedTarget = idMapping.fromRefId(delta.replacedTarget);
                return new EntryMovedAndReplacedInSameReferenceDelta(parent, reference, oldIndex, newIndex, movedTarget, replacedTarget);
            }
            case "Composite": {
                const parts = delta.parts.map(deserializedDelta);
                return new CompositeDelta(parts);
            }
            case "NoOp": {
                return new NoOpDelta();
            }
        }
    }
    return deserializedDelta;
}

