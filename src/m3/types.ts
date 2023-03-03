/**
 * TypeScript type definitions for the `LIonCore` M3 (=meta-meta) model.
 * A LIonWeb metamodel (at the M2 meta level) can be represented as an instance of the {@link Metamodel} type.
 */

import {MultiRef, SingleRef, unresolved} from "../references.ts"
import {Id, Node} from "../types.ts"
import {allFeaturesOf} from "./functions.ts"


/**
 * Joins fragments of a qualified name using the `.` character.
 */
export const qualify = (...names: (string|undefined)[]): string =>
    names
        .filter((name) => typeof name === "string")
        .join(".")


/**
 * The qualified name of the LIonCore metamodel containing the built-in {@link PrimitiveType primitive types}.
 * (It's defined here because its knowledge intrinsic to all LIonCore M3 instances.
 */
export const lioncoreBuiltinsQName = "LIonCore.builtins"


/**
 * Abstract base class for nodes in an LIonCore/M3-instance,
 * providing an ID and the containment hierarchy.
 */
abstract class M3Node implements Node {
    parent?: NamespaceProvider
        /*
         * Note: every parent in an M2 (i.e., a Metamodel, Concept, ConceptInterface, Enumeration) also happens to be a namespace.
         * This is why we can give `parent` the narrower type `NamespaceProvider` instead of `NodeClass`.
         */
    id: Id
    protected constructor(id: Id, parent?: NamespaceProvider) {
        this.id = id
        this.parent = parent
    }
}
/*
 * Note: this definition should be moved up to src/types.ts
 * to express that all nodes except roots/unattached nodes have a parent
 * (of a parametrized type).
 */


interface NamespaceProvider extends Node {
    namespaceQualifier(): string
}

abstract class NamespacedEntity extends M3Node {
    name: string
    protected constructor(parent: NamespaceProvider, name: string, id: Id) {
        super(id, parent)
        this.name = name
    }
    qualifiedName() {
        return qualify(this.parent?.namespaceQualifier(), this.name)
    }
}

class Metamodel extends M3Node implements NamespaceProvider {
    name: string
    elements: MetamodelElement[] = []   // (containment)
    dependsOn: MultiRef<Metamodel> = []  // special (!) reference
        // (!) special because deserializer needs to be aware of where to get the instance from
    constructor(name: string, id: Id) {
        super(id)
        this.name = name
    }
    namespaceQualifier(): string {
        return this.name
    }
    havingElements(...elements: MetamodelElement[]) {
        this.elements.push(...elements)
        return this
    }
    dependingOn(...metamodels: Metamodel[]) {
        this.dependsOn.push(
            ...metamodels
                .filter((metamodel) => metamodel.name !== lioncoreBuiltinsQName)
        )
        return this
    }
}

abstract class MetamodelElement extends NamespacedEntity {
    constructor(metamodel: Metamodel, name: string, id: Id) {
        super(metamodel, name, id)
    }
}

abstract class FeaturesContainer extends MetamodelElement implements NamespaceProvider {
    features: Feature[] = [] // (containment)
    havingFeatures(...features: Feature[]) {
        this.features.push(...features)
        return this
    }
    abstract allFeatures(): Feature[]
    namespaceQualifier(): string {
        return this.qualifiedName()
    }
}

class Concept extends FeaturesContainer {
    abstract: boolean
    extends?: SingleRef<Concept>    // (reference)
    implements: MultiRef<ConceptInterface> = []  // (reference)
    constructor(metamodel: Metamodel, name: string, id: Id, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(metamodel, name, id)
        this.abstract = abstract
        this.extends = extends_
    }
    implementing(...conceptInterfaces: ConceptInterface[]) {
        this.implements.push(...conceptInterfaces)
        return this
    }
    allFeatures(): Feature[] {
        return allFeaturesOf(this)
    }
}

class ConceptInterface extends FeaturesContainer {
    extends: MultiRef<ConceptInterface> = []    // (reference)
    allFeatures(): Feature[] {
        return allFeaturesOf(this)
    }
}

abstract class Feature extends NamespacedEntity {
    optional /*: boolean */ = false
    derived /*: boolean */ = false
    constructor(featuresContainer: FeaturesContainer, name: string, id: Id) {
        super(featuresContainer, name, id)
    }
    isDerived() {
        this.derived = true
        return this
    }
    isOptional() {
        this.optional = true
        return this
    }
}

abstract class Link extends Feature {
    multiple /*: boolean */ = false
    type: SingleRef<FeaturesContainer> = unresolved   // (reference)
    ofType(type: FeaturesContainer) {
        this.type = type
        return this
    }
    isMultiple() {
        this.multiple = true
        return this
    }
}

class Reference extends Link {
}

class Containment extends Link {
}

class Property extends Feature {
    type: SingleRef<Datatype> = unresolved   // (reference)
    /**
     * Indicates whether this property targets the _programmatic_ aspect of
     * the LIonCore/M3 instance.
     */
    programmatic /*: boolean */ = false
    ofType(type: Datatype) {
        this.type = type
        return this
    }
    isProgrammatic() {
        this.programmatic = true
        return this
    }
}

abstract class Datatype extends MetamodelElement {}

class PrimitiveType extends Datatype {}

class Enumeration extends Datatype implements NamespaceProvider {
    literals: EnumerationLiteral[] = [] // (containment)
    namespaceQualifier(): string {
        return qualify(this.parent?.namespaceQualifier(), this.name)
    }
}

class EnumerationLiteral extends NamespacedEntity {
    constructor(enumeration: Enumeration, name: string, id: Id) {
        super(enumeration, name, id)
    }
}


/**
 * Sum type of all LIonCore type definitions whose meta-type is a concrete (thus: instantiable) Concept.
 */
type M3Concept =
    | Metamodel
    // ▼▼▼ all NamespacedEntity-s
    | Concept
    | ConceptInterface
    | Enumeration
    // ▲▲▲ all NamespaceProvider-s
    | EnumerationLiteral
    | PrimitiveType
    | Containment
    | Property
    | Reference


export {
    Concept,
    ConceptInterface,
    Containment,
    Datatype,
    Enumeration,
    EnumerationLiteral,
    Feature,
    FeaturesContainer,
    Link,
    Metamodel,
    MetamodelElement,
    PrimitiveType,
    Property,
    Reference
}
export type {
    M3Concept
}

