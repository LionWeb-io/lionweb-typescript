/**
 * TypeScript type definitions for the `lioncore` M3 (=meta-meta) model.
 * A LIonWeb metamodel (at the M2 meta level) can be represented as an instance of the {@link Metamodel} type.
 */

import {SingleRef, unresolved} from "../references.ts"
import {allFeaturesOf} from "./functions.ts"


interface NamespaceProvider {
    namespaceQualifier(): string
}

abstract class NamespacedEntity {
    simpleName: string
    container: NamespaceProvider
    protected constructor(container: NamespaceProvider, simpleName: string) {
        this.container = container
        this.simpleName = simpleName
    }
    qualifiedName() {
        return `${this.container.namespaceQualifier()}.${this.simpleName}`
    }
}

class Metamodel implements NamespaceProvider {
    qualifiedName: string
    elements: MetamodelElement[] = []   // (containment)
    constructor(qualifiedName: string) {
        this.qualifiedName = qualifiedName
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
    constructor(metamodel: Metamodel, simpleName: string) {
        super(metamodel, simpleName)
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
    implements: ConceptInterface[] = []  // (reference)
    constructor(metamodel: Metamodel, simpleName: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(metamodel, simpleName)
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
    extends: ConceptInterface[] = []    // (reference)
    allFeatures(): Feature[] {
        return allFeaturesOf(this)
    }
}

class Annotation extends FeaturesContainer {
    platformSpecific?: string
    allFeatures(): Feature[] {
        return this.features
    }
}

enum Multiplicity {
    Optional,
    Single,
    ZeroOrMore,
    OneOrMore
}

abstract class Feature extends NamespacedEntity {
    multiplicity: Multiplicity
    derived /*: boolean */ = false
    constructor(featuresContainer: FeaturesContainer, simpleName: string, multiplicity: Multiplicity) {
        super(featuresContainer, simpleName)
        this.multiplicity = multiplicity
    }
    isDerived() {
        this.derived = true
        return this
    }
}

abstract class Link extends Feature {
    type: SingleRef<FeaturesContainer> = unresolved   // (reference)
    ofType(type: FeaturesContainer) {
        this.type = type
        return this
    }
}

class Reference extends Link {
    specializes: Reference[] = []   // (reference)
}

class Containment extends Link {
    specializes: Containment[] = [] // (reference)
}

class Property extends Feature {
    type: SingleRef<Datatype> = unresolved   // (reference)
    ofType(type: Datatype) {
        this.type = type
        return this
    }
}

abstract class Datatype extends MetamodelElement {}

// TODO  -> TypeDefinition, because it'd be the only shortened name
class Typedef extends Datatype {
    constraints: PrimitiveType[] = [] // (reference)
}

class PrimitiveType extends Datatype {}

// TODO  put in meta-circular definition of lioncore
class Enumeration extends Datatype implements NamespaceProvider {
    literals: EnumerationLiteral[] = [] // (containment)
    namespaceQualifier(): string {
        return `${this.container.namespaceQualifier()}.${this.simpleName}`
    }
}

class EnumerationLiteral extends NamespacedEntity {
    constructor(enumeration: Enumeration, simpleName: string) {
        super(enumeration, simpleName)
    }
}


/**
 * Sum type of all lioncore type definitions whose meta-type is a concrete (thus: instantiable) Concept.
 */
type M3Concept =
    | Metamodel
    | Concept
    | ConceptInterface
    | Annotation
    | Property
    | Containment
    | Reference
    | PrimitiveType
    | Typedef
    // | Enumeration
    | EnumerationLiteral


export {
    FeaturesContainer,
    Annotation,
    Concept,
    ConceptInterface,
    Containment,
    Datatype,
    Enumeration,
    EnumerationLiteral,
    Feature,
    Link,
    Metamodel,
    Multiplicity,
    PrimitiveType,
    Property,
    Reference,
    Typedef
}
export type {
    M3Concept,
    MetamodelElement,
}

