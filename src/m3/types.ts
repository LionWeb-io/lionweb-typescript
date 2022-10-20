/**
 * TypeScript type definitions for the `lioncore` M3 (=meta-meta) model.
 */

import {isRef, SingleRef, unresolved} from "../references.ts"


interface NamespaceProvider {
    namespaceQualifier(): string
}

abstract class NamespacedEntity {
    simpleName: string
    container: NamespaceProvider
    constructor(container: NamespaceProvider, simpleName: string) {
        this.simpleName = simpleName
        this.container = container
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
    protected constructor(metamodel: Metamodel, simpleName: string) {
        super(metamodel, simpleName)
    }
}

abstract class FeaturesContainer extends MetamodelElement {
    features: Feature[] = [] // (containment)
    protected constructor(metamodel: Metamodel, simpleName: string) {
        super(metamodel, simpleName)
    }
    havingFeatures(...features: Feature[]) {
        this.features.push(...features)
        return this
    }
    abstract allFeatures(): Feature[]
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
        return [
            ...this.features,
            ...(isRef(this.extends) ? this.extends.allFeatures() : []),
            ...this.implements.flatMap((conceptInterface) => conceptInterface.allFeatures())
        ]
    }
}

class ConceptInterface extends FeaturesContainer {
    extends: ConceptInterface[] = []    // (reference)
    constructor(metamodel: Metamodel, simpleName: string) {
        super(metamodel, simpleName)
    }
    allFeatures(): Feature[] {
        return this.extends.flatMap((conceptInterface) => conceptInterface.allFeatures())
    }
}

class Annotation extends FeaturesContainer {
    platformSpecific?: string
    constructor(metamodel: Metamodel, simpleName: string) {
        super(metamodel, simpleName)
    }
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

abstract class Feature {
    name: string    // FIXME  deviation from proposal!
    multiplicity: Multiplicity
    derived /*: boolean */ = false
    protected constructor(name: string, multiplicity: Multiplicity) {
        this.name = name
        this.multiplicity = multiplicity
    }
    isDerived() {
        this.derived = true
        return this
    }
}

abstract class Link extends Feature {
    type: SingleRef<FeaturesContainer> = unresolved   // (reference)
    constructor(simpleName: string, multiplicity: Multiplicity) {
        super(simpleName, multiplicity)
    }
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
    constructor(name: string, multiplicity: Multiplicity) {
        super(name, multiplicity)
    }
    ofType(type: Datatype) {
        this.type = type
        return this
    }
}

abstract class Datatype extends MetamodelElement {
    constructor(metamodel: Metamodel, simpleName: string) {
        super(metamodel, simpleName)
    }
}

// TODO  -> TypeDefinition, because it'd be the only shortened name
class Typedef extends Datatype {
    constraints: PrimitiveType[] = [] // (reference)
}

class PrimitiveType extends Datatype {}


// TODO  put in meta-circular definition of lioncore
class Enumeration extends Datatype {
    literals: EnumerationLiteral[] = [] // (containment)
}

class EnumerationLiteral {
    name: string    // FIXME  deviation from proposal!
    constructor(name: string) {
        this.name = name
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
    | Feature   // FIXME  not an instantiable concept, so should not be in here


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
    Typedef,
    unresolved
}
export type {
    M3Concept,
    MetamodelElement,
    SingleRef
}

