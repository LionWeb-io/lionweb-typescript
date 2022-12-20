/**
 * TypeScript type definitions for the `LIonCore` M3 (=meta-meta) model.
 * A LIonWeb metamodel (at the M2 meta level) can be represented as an instance of the {@link Metamodel} type.
 */

import {MultiRef, SingleRef, unresolved} from "../references.ts"
import {Id, Node} from "../types.ts"
import {allFeaturesOf} from "./functions.ts"


interface NamespaceProvider {
    namespaceQualifier(): string
}

abstract class NamespacedEntity implements Node {
    simpleName: string
    id: Id
    container: NamespaceProvider
    protected constructor(container: NamespaceProvider, simpleName: string, id: Id) {
        this.container = container
        this.simpleName = simpleName
        this.id = id
    }
    qualifiedName() {
        return `${this.container.namespaceQualifier()}.${this.simpleName}`
    }
}

class Metamodel implements NamespaceProvider, Node {
    qualifiedName: string
    id: Id
    elements: MetamodelElement[] = []   // (containment)
    constructor(qualifiedName: string, id: Id) {
        this.qualifiedName = qualifiedName
        this.id = id
    }
    namespaceQualifier(): string {
        return this.qualifiedName
    }
    havingElements(...elements: MetamodelElement[]) {
        this.elements.push(...elements)
        return this
    }
}

abstract class MetamodelElement extends NamespacedEntity {
    constructor(metamodel: Metamodel, simpleName: string, id: Id) {
        super(metamodel, simpleName, id)
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
    constructor(metamodel: Metamodel, simpleName: string, id: Id, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(metamodel, simpleName, id)
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
    constructor(featuresContainer: FeaturesContainer, simpleName: string, id: Id) {
        super(featuresContainer, simpleName, id)
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
     * Indicates whether this property is “disputed” in the sense that
     * it's not in the agreed-on version of M3/LIonCore, but it's necessary
     * in order to be able to self-define LIonCore.
     */
    disputed: boolean = false
    ofType(type: Datatype) {
        this.type = type
        return this
    }
    isDisputed() {
        this.disputed = true
        return this
    }
}

abstract class Datatype extends MetamodelElement {}


class PrimitiveType extends Datatype {}

class Enumeration extends Datatype implements NamespaceProvider {
    literals: EnumerationLiteral[] = [] // (containment)
    namespaceQualifier(): string {
        return `${this.container.namespaceQualifier()}.${this.simpleName}`
    }
}

class EnumerationLiteral extends NamespacedEntity {
    constructor(enumeration: Enumeration, simpleName: string, id: Id) {
        super(enumeration, simpleName, id)
    }
}


/**
 * Sum type of all LIonCore type definitions whose meta-type is a concrete (thus: instantiable) Concept.
 */
type M3Concept =
    | Metamodel
    | Concept
    | ConceptInterface
    | Property
    | Containment
    | Reference
    | PrimitiveType
    | Enumeration
    | EnumerationLiteral


export {
    FeaturesContainer,
    Concept,
    ConceptInterface,
    Containment,
    Datatype,
    Enumeration,
    EnumerationLiteral,
    Feature,
    Link,
    Metamodel,
    PrimitiveType,
    Property,
    Reference
}
export type {
    M3Concept,
    MetamodelElement,
}

