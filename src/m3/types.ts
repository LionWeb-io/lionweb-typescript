/**
 * TypeScript type definitions for the `LIonCore` M3 (=meta-meta) model.
 * A LIonWeb language (at the M2 meta level) can be represented as an instance of the {@link Language} type.
 */

import {MultiRef, SingleRef, unresolved} from "../references.ts"
import {Id, Node} from "../types.ts"
import {allFeaturesOf} from "./functions.ts"
import {KeyGenerator} from "./key-generation.ts"


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
         * This is why we can give `parent` the narrower type `NamespaceProvider` instead of `M3Node`.
         */
    readonly id: Id
    key: string // TODO  make this a specific type?
    protected constructor(id: Id, key: string, parent?: NamespaceProvider) {
        this.id = id
        this.key = key
        this.parent = parent
    }
    havingKey(key: string) {
        this.key = key
        return this
    }

    /**
     * Sets the key of this {@link M3Node} using the given {@link KeyGenerator key generator}.
     * Note: this doesn't need to be idempotent!
     */
    keyed(keyGenerator: KeyGenerator) {
        this.key = keyGenerator(this as unknown as M3Concept)
            // FIXME  the cast smells like a hack...
        return this
    }
}


interface NamespaceProvider extends Node {
    namespaceQualifier(): string
}

abstract class NamespacedEntity extends M3Node {
    name: string
    protected constructor(parent: NamespaceProvider, name: string, key: string, id: Id) {
        super(id, key, parent)
        this.name = name
    }
    qualifiedName() {
        return qualify(this.parent?.namespaceQualifier(), this.name)
    }
}

class Language implements NamespaceProvider, Node {
    readonly id: string
    name: string
    version: string
    elements: LanguageElement[] = []   // (containment)
    dependsOn: MultiRef<Language> = []  // special (!) reference
        // (!) special because deserializer needs to be aware of where to get the instance from
    constructor(name: string, version: string, id: Id) {
        this.id = id
        this.name = name
        this.version = version
    }
    namespaceQualifier(): string {
        return this.name
    }
    havingElements(...elements: LanguageElement[]): Language {
        const nonLanguageElements = elements.filter((element) => !(element instanceof LanguageElement))
        if (nonLanguageElements.length > 0) {
            throw Error(`trying to add non-LanguageElements to Language: ${nonLanguageElements.map((node) => `<${node.constructor.name}>"${node.name}"`).join(", ")}`)
        }
        this.elements.push(...elements)
        return this
    }
    dependingOn(...metamodels: Language[]): Language {
        // TODO  check actual types of metamodels, or use type shapes/interfaces
        this.dependsOn.push(
            ...metamodels
                .filter((metamodel) => metamodel.name !== lioncoreBuiltinsQName)
        )
        return this
    }
}

abstract class LanguageElement extends NamespacedEntity {
    constructor(language: Language, name: string, key: string, id: Id) {
        super(language, name, key, id)
    }
}

abstract class FeaturesContainer extends LanguageElement implements NamespaceProvider {
    features: Feature[] = [] // (containment)
    havingFeatures(...features: Feature[]) {
        // TODO  check actual types of features, or use type shapes/interfaces
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
    constructor(language: Language, name: string, key: string, id: Id, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(language, name, key, id)
        this.abstract = abstract
        this.extends = extends_
    }
    implementing(...conceptInterfaces: ConceptInterface[]): Concept {
        // TODO  check actual types of concept interfaces, or use type shapes/interfaces
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
    constructor(featuresContainer: FeaturesContainer, name: string, key: string, id: Id) {
        super(featuresContainer, name, key, id)
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
    ofType(type: Datatype): Property {
        this.type = type
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
    constructor(enumeration: Enumeration, name: string, key: string, id: Id) {
        super(enumeration, name, key, id)
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
    NamespacedEntity,
    PrimitiveType,
    Property,
    Reference,
    lioncoreBuiltinsQName,
    qualify
}
export type {
    M3Concept
}

