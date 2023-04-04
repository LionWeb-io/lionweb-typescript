/**
 * TypeScript type definitions for the `LIonCore` M3 (=meta-meta) model.
 * A LIonWeb language (at the M2 meta level) can be represented as an instance of the {@link Language} type.
 */

import {MultiRef, SingleRef, unresolved} from "../references.ts"
import {Id, Node} from "../types.ts"
import {allFeaturesOf} from "./functions.ts"


/**
 * Joins fragments of a qualified name using the `.` character.
 */
const qualify = (...names: (string|undefined)[]): string =>
    names
        .filter((name) => typeof name === "string")
        .join(".")


/**
 * The qualified name of the LIonCore language containing the built-in {@link PrimitiveType primitive types}.
 * (It's defined here because its knowledge intrinsic to all LIonCore M3 instances.
 */
const lioncoreBuiltinsQName = "LIonCore.builtins"


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

class Language extends M3Node implements NamespaceProvider {
    name: string
    version: string
    elements: LanguageElement[] = []   // (containment)
    dependsOn: MultiRef<Language> = []  // special (!) reference
        // (!) special because deserializer needs to be aware of where to get the instance from
    constructor(name: string, version: string, id: Id) {
        super(id)
        this.name = name
        this.version = version
    }
    namespaceQualifier(): string {
        return this.name
    }
    havingElements(...elements: LanguageElement[]) {
        this.elements.push(...elements)
        return this
    }
    dependingOn(...metamodels: Language[]) {
        this.dependsOn.push(
            ...metamodels
                .filter((metamodel) => metamodel.name !== lioncoreBuiltinsQName)
        )
        return this
    }
}

abstract class LanguageElement extends NamespacedEntity {
    constructor(language: Language, name: string, id: Id) {
        super(language, name, id)
    }
}

abstract class FeaturesContainer extends LanguageElement implements NamespaceProvider {
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
    constructor(language: Language, name: string, id: Id, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(language, name, id)
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
    computed /*: boolean */ = false
    constructor(featuresContainer: FeaturesContainer, name: string, id: Id) {
        super(featuresContainer, name, id)
    }
    isComputed() {
        this.computed = true
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

abstract class Datatype extends LanguageElement {}

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
    | Language
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
    Language,
    LanguageElement,
    Link,
    PrimitiveType,
    Property,
    Reference,
    lioncoreBuiltinsQName,
    qualify
}
export type {
    M3Concept
}

