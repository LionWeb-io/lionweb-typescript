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

import { Containment, MemoisingSymbolTable, Property, Reference } from "@lionweb/core";

import { ILanguageBase } from "../../base-types.js";
import { IdMapping } from "../../id-mapping.js";
import { SerializedDelta } from "./types.g.js";
import { DeltaDeserializer } from "./base.js";
import {
    AnnotationAddedDelta,
    AnnotationDeletedDelta,
    AnnotationMovedFromOtherParentDelta,
    AnnotationMovedInSameParentDelta,
    AnnotationReplacedDelta,
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedDelta,
    ChildMovedInSameContainmentDelta,
    ChildReplacedDelta,
    NoOpDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceDeletedDelta,
    ReferenceMovedDelta,
    ReferenceMovedInSameReferenceDelta,
    ReferenceReplacedDelta
} from "../types.g.js";


export const deltaDeserializer = (languageBases: ILanguageBase[], idMapping: IdMapping): DeltaDeserializer => {
    const symbolTable = new MemoisingSymbolTable(languageBases.map(({language}) => language));
    return (delta: SerializedDelta) => {
        switch (delta.kind) {
            case "NoOp": {
                return new NoOpDelta();
            }
            case "PropertyAdded": {
                const container = idMapping.fromId(delta.container);
                const property = symbolTable.featureMatching(container.classifier.metaPointer(), delta.property) as Property;
                const value = delta.value;
                return new PropertyAddedDelta(container, property, value);
            }
            case "PropertyDeleted": {
                const container = idMapping.fromId(delta.container);
                const property = symbolTable.featureMatching(container.classifier.metaPointer(), delta.property) as Property;
                const oldValue = delta.oldValue;
                return new PropertyDeletedDelta(container, property, oldValue);
            }
            case "PropertyChanged": {
                const container = idMapping.fromId(delta.container);
                const property = symbolTable.featureMatching(container.classifier.metaPointer(), delta.property) as Property;
                const oldValue = delta.oldValue;
                const newValue = delta.newValue;
                return new PropertyChangedDelta(container, property, oldValue, newValue);
            }
            case "ChildAdded": {
                const parent = idMapping.fromId(delta.parent);
                const containment = symbolTable.featureMatching(parent.classifier.metaPointer(), delta.containment) as Containment;
                const index = delta.index;
                const newChild = idMapping.fromId(delta.newChild);
                return new ChildAddedDelta(parent, containment, index, newChild);
            }
            case "ChildDeleted": {
                const parent = idMapping.fromId(delta.parent);
                const containment = symbolTable.featureMatching(parent.classifier.metaPointer(), delta.containment) as Containment;
                const index = delta.index;
                const deletedChild = idMapping.fromId(delta.deletedChild);
                return new ChildDeletedDelta(parent, containment, index, deletedChild);
            }
            case "ChildReplaced": {
                const parent = idMapping.fromId(delta.parent);
                const containment = symbolTable.featureMatching(parent.classifier.metaPointer(), delta.containment) as Containment;
                const index = delta.index;
                const replacedChild = idMapping.fromId(delta.replacedChild);
                const newChild = idMapping.fromId(delta.newChild);
                return new ChildReplacedDelta(parent, containment, index, replacedChild, newChild);
            }
            case "ChildMoved": {
                const oldParent = idMapping.fromId(delta.oldParent);
                const oldContainment = symbolTable.featureMatching(oldParent.classifier.metaPointer(), delta.oldContainment) as Containment;
                const oldIndex = delta.oldIndex;
                const newParent = idMapping.fromId(delta.newParent);
                const newContainment = symbolTable.featureMatching(newParent.classifier.metaPointer(), delta.newContainment) as Containment;
                const newIndex = delta.newIndex;
                const child = idMapping.fromId(delta.child);
                return new ChildMovedDelta(oldParent, oldContainment, oldIndex, newParent, newContainment, newIndex, child);
            }
            case "ChildMovedInSameContainment": {
                const parent = idMapping.fromId(delta.parent);
                const containment = symbolTable.featureMatching(parent.classifier.metaPointer(), delta.containment) as Containment;
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const child = idMapping.fromId(delta.child);
                return new ChildMovedInSameContainmentDelta(parent, containment, oldIndex, newIndex, child);
            }
            case "ReferenceAdded": {
                const container = idMapping.fromId(delta.container);
                const reference = symbolTable.featureMatching(container.classifier.metaPointer(), delta.reference) as Reference;
                const index = delta.index;
                const newTarget = idMapping.fromRefId(delta.newTarget);
                return new ReferenceAddedDelta(container, reference, index, newTarget);
            }
            case "ReferenceDeleted": {
                const container = idMapping.fromId(delta.container);
                const reference = symbolTable.featureMatching(container.classifier.metaPointer(), delta.reference) as Reference;
                const index = delta.index;
                const deletedTarget = idMapping.fromRefId(delta.deletedTarget);
                return new ReferenceDeletedDelta(container, reference, index, deletedTarget);
            }
            case "ReferenceReplaced": {
                const container = idMapping.fromId(delta.container);
                const reference = symbolTable.featureMatching(container.classifier.metaPointer(), delta.reference) as Reference;
                const index = delta.index;
                const replacedTarget = idMapping.fromRefId(delta.replacedTarget);
                const newTarget = idMapping.fromRefId(delta.newTarget);
                return new ReferenceReplacedDelta(container, reference, index, replacedTarget, newTarget);
            }
            case "ReferenceMoved": {
                const oldContainer = idMapping.fromId(delta.oldContainer);
                const oldReference = symbolTable.featureMatching(oldContainer.classifier.metaPointer(), delta.oldReference) as Reference;
                const oldIndex = delta.oldIndex;
                const newContainer = idMapping.fromId(delta.newContainer);
                const newReference = symbolTable.featureMatching(newContainer.classifier.metaPointer(), delta.newReference) as Reference;
                const newIndex = delta.newIndex;
                const target = idMapping.fromRefId(delta.target);
                return new ReferenceMovedDelta(oldContainer, oldReference, oldIndex, newContainer, newReference, newIndex, target);
            }
            case "ReferenceMovedInSameReference": {
                const container = idMapping.fromId(delta.container);
                const reference = symbolTable.featureMatching(container.classifier.metaPointer(), delta.reference) as Reference;
                const oldIndex = delta.oldIndex;
                const newIndex = delta.newIndex;
                const target = idMapping.fromRefId(delta.target);
                return new ReferenceMovedInSameReferenceDelta(container, reference, oldIndex, newIndex, target);
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
        }
    }
}

