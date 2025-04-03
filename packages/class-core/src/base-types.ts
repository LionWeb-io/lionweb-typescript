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
    allFeaturesOf,
    Classifier,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Concept,
    Containment,
    EnumerationLiteral,
    Feature,
    Id,
    Language,
    Node,
    Property,
    Reference
} from "@lionweb/core";
import {makeObservable} from "mobx";

import {
    AnnotationsValueManager,
    ContainmentValueManager,
    DeltaHandler,
    FeatureValueManager,
    MultiContainmentValueManager,
    PropertyValueManager,
    ReferenceValueManager,
    SingleContainmentValueManager
} from "./index.js";


/**
 * Encodes how a {@link INodeBase} is contained by a parent.
 * If the {@code containingFeature} is {@code null}, the {@link INodeBase} is an annotation
 * and effectively contained by the {@link INodeBase.annotations} property.
 */
export type Parentage = [ parent: INodeBase, containingFeature: Containment | null ];


/**
 * The base interface for node objects that know about how they're contained,
 * know what their {@link Classifier meta-type} is,
 * and manage the values of their features through {@link ValueManager value managers}
 * that are wired up for observability (according to the MobX library) and emission of deltas.
 */
export interface INodeBase extends Node {

    classifier: Classifier;

    /**
     * The parent of this node object,
     * or {@code undefined} if it's either a root (in which case it {@code this.classifier} should be a {@link Concept} which is a partition)
     *  or (currently/temporarily) an orphan.
     */
    parent: INodeBase | undefined;

    /**
     * The {@link Containment containment feature} through which this node is contained by its parent,
     * or `null` if it's an annotation,
     * or `undefined` exactly when `parent` is also `undefined`.
     */
    containment: Containment | null | undefined;

    /**
     * Attach this node to the given `parent` {@link INodeBase}, through the given `containment` {@link Containment}.
     *Note* that this is **for internal use only**!
     */
    attachTo(parent: INodeBase, containment: Containment | null): void;

    /**
     * Detach this node from its stated parent(age).
     * *Note* that this is **for internal use only**!
     */
    detach(): void;


    /**
     * @return the value manager for the given {@link Property property} feature.
     * @throws if this node('s {@link Classifier classifier}) doesn't have that property.
     */
    getPropertyValueManager(property: Property): PropertyValueManager<unknown>;

    /**
     * @return the value manager for the given {@link Containment containment} feature.
     * @throws if this node('s {@link Classifier classifier}) doesn't have that containment.
     */
    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase>;

    /**
     * @return the value manager for the given {@link Reference reference} feature.
     * @throws if this node('s {@link Classifier classifier}) doesn't have that reference.
     */
    getReferenceValueManager(reference: Reference): ReferenceValueManager<INodeBase>;

    /**
     * @return the value manager for the given {@link Feature feature}.
     * @throws if this node('s {@link Classifier classifier}) doesn't have that feature.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFeatureValueManager(feature: Feature): FeatureValueManager<Feature>;

    /**
     * @return the value manager for the annotations.
     */
    annotationsValueManager: AnnotationsValueManager;

    /**
     * The annotations annotating this node.
     */
    annotations: INodeBase[];

    /**
     * Adds the given annotation (as an instance of {@link INodeBase}) to the annotations of this node.
     */
    addAnnotation(annotation: INodeBase): void;

    /**
     * Inserts the given annotation (as an instance of {@link INodeBase}) among the annotations of this node,
     * displacing all existing annotations with index &geq; the given one “to the right”.
     */
    insertAnnotationAtIndex(annotation: INodeBase, index: number): void;

    /**
     * Moves the annotation at the given `oldIndex` to the `newIndex` position.
     */
    moveAnnotation(oldIndex: number, newIndex: number): void;

    /**
     * Replaces the existing annotation at the given index, with the given annotation (as an instance of {@link INodeBase}).
     */
    replaceAnnotationAtIndex(annotation: INodeBase, index: number): void;

    /**
     * Removes the given annotation (as an instance of {@link INodeBase}) from the annotations of this node.
     * (In the case of duplicates, only the first occurrence is removed.)
     */
    removeAnnotation(annotation: INodeBase): void;


    /**
     * @return the {@link Feature features} of the {@link Classifier} that is this node's meta-type,
     * that are set.
     * A feature has a set value if it's not `undefined` for single-valued features,
     * or an empty array `[]` for multi-valued features.
     *
     * Note* that this is (in principle) **for internal use only**!
     */
    get setFeatures(): Feature[];

    /**
     * @return all children – not all descendants! – of this node, including directly-contained annotations.
     *Note* that this is (in principle) **for internal use only**!
     */
    get children(): INodeBase[];


    /**
     * An optionally-installed {@link DeltaHandler}.
     */
    handleDelta?: DeltaHandler;


    /**
     * A message to indicate this node's meta-type (including originating language) and its ID.
     */
    locationMessage: string;

}


/**
 * The base type for any node that's managed by a, potentially delta-emitting, API.
 *
 * It receives a {@link DeltaHandler} to pass {@link IDelta deltas} to
 * that occur due to changes to values of its features,
 * as well as moving among parents and deletion.
 *
 * It keeps explicit track of how it's contained by its parent (when it has one),
 * to make moving children among parents easier.
 */
export abstract class NodeBase implements INodeBase {

    private _parentage?: Parentage;
    get parent(): INodeBase | undefined {
        return this._parentage?.[0];
    }

    get containment(): Containment | null | undefined {
        return this._parentage?.[1];
    }

    /*
     * Note: the tuple [_parent, _containingFeature] can only be set simultaneously, through the attachTo method.
     */

    attachTo(parent: INodeBase, containingFeature: Containment | null) {
        this._parentage = [parent, containingFeature];
    }

    detach() {
        this._parentage = undefined;
    }


    protected constructor(readonly classifier: Classifier, readonly id: Id, readonly handleDelta?: DeltaHandler, parentage?: Parentage) {
        this.classifier = classifier;
        this.id = id;
        if (parentage) {
            this.attachTo(parentage[0], parentage[1]);
        }
        makeObservable(this);
    }

    get locationMessage(): string {
        return `instance of ${this.classifier.language.name}.${this.classifier.name} with id=${this.id}`;
    }


    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        throw new Error(`property (feature) "${property.name}" (with key=${property.key}) doesn't exist on ${this.locationMessage}`);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        throw new Error(`containment (feature) "${containment.name}" (with key=${containment.key}) doesn't exist on ${this.locationMessage}`);
    }

    getReferenceValueManager(reference: Reference): ReferenceValueManager<INodeBase> {
        throw new Error(`reference (feature) "${reference.name}" (with key=${reference.key}) doesn't exist on ${this.locationMessage}`);
    }

    getFeatureValueManager(feature: Feature): FeatureValueManager<Feature> {
        if (feature instanceof Property) {
            return this.getPropertyValueManager(feature);
        }
        if (feature instanceof Containment) {
            return this.getContainmentValueManager(feature);
        }
        if (feature instanceof Reference) {
            return this.getReferenceValueManager(feature);
        }
        throw new Error(`unhandled Feature sub type ${feature.constructor.name}`)
    }


    get setFeatures(): Feature[] {
        return allFeaturesOf(this.classifier)
            .filter((feature) => this.getFeatureValueManager(feature).isSet());
    }

    get children(): INodeBase[] {
        return [
            ...(this.setFeatures
                .filter((feature) => feature instanceof Containment)
                .flatMap((feature) => {
                    const valueManager = this.getContainmentValueManager(feature as Containment);
                    if (valueManager instanceof SingleContainmentValueManager) {
                        return valueManager.isSet() ? [valueManager.getDirectly()] : [];
                    }
                    if (valueManager instanceof MultiContainmentValueManager) {
                        return valueManager.get();
                    }
                    throw new Error(`don't know how to obtain value of feature ${feature.name} of classifier ${this.classifier.name} in language ${this.classifier.language.name}`);
                })),
            ...this.annotations
        ];
    }


    readonly annotationsValueManager: AnnotationsValueManager = new AnnotationsValueManager(this);
    get annotations(): INodeBase[] {
        return this.annotationsValueManager.get();
    }

    addAnnotation(annotation: INodeBase) {
        this.annotationsValueManager.add(annotation);
    }

    insertAnnotationAtIndex(annotation: INodeBase, index: number) {
        this.annotationsValueManager.insertAtIndex(annotation, index);
    }

    moveAnnotation(oldIndex: number, newIndex: number) {
        this.annotationsValueManager.move(oldIndex, newIndex);
    }

    replaceAnnotationAtIndex(annotation: INodeBase, index: number) {
        this.annotationsValueManager.replaceAtIndex(annotation, index);
    }

    removeAnnotation(annotation: INodeBase) {
        this.annotationsValueManager.remove(annotation);
    }

}


/**
 * A type for functions that acts as factories, creating an instance of {@link INodeBase}
 * matching the given {@link Classifier classifier} and the given ID (of type {@link Id}).
 */
export type NodeBaseFactory = (classifier: Classifier, id: Id) => INodeBase;

/**
 * A type that captures three base aspects of a language:
 * its {@link Language definition},
 * a method to produce {@link NodeBaseFactory factories},
 * and a method to produce a runtime representation of a given {@link EnumerationLiteral}.
 */
export interface ILanguageBase {
    language: Language;
    factory(handleDelta?: DeltaHandler): NodeBaseFactory;
    enumLiteralFrom<T>(enumerationLiteral: EnumerationLiteral): T;
}


/**
 * Removes the given child node from its parent, and returns its containment index.
 */
export const removeFromParent = (parent: INodeBase | undefined, child: INodeBase): number => {
    if (parent === undefined) {
        throw new Error(`can't remove an orphan from its parent`);
    }
    if (child.containment instanceof Containment) {
        const valueManager = parent.getContainmentValueManager(child.containment);
        if (valueManager instanceof SingleContainmentValueManager) {
            valueManager.setDirectly(undefined);
            return 0;
        } else if (valueManager instanceof MultiContainmentValueManager) {
            return valueManager.removeDirectly(child);
        } else {
            throw new Error(`don't know how to remove a child that's contained through a value manager of type ${valueManager.constructor.name}`);
        }
    }
    if (child.containment === null) {
        return parent.annotationsValueManager.removeDirectly(child);
    }
    throw new Error(`not going to remove a child from its parent without knowing how it's contained`);
}

