/**
 * TypeScript type definitions for the `lioncore` M3 (=meta-meta) model.
 */

import {isRef, SingleRef, unresolved} from "../references.ts"


class Metamodel {
    qualifiedName: string
    elements: MetamodelElement[] = []   // (containment)
    constructor(qualifiedName: string) {
        this.qualifiedName = qualifiedName
    }
    havingElements(...elements: MetamodelElement[]) {
        this.elements.push(...elements)
        return this
    }
}

interface MetamodelElement {
    name: string    // FIXME  deviation from proposal!
}

abstract class FeaturesContainer implements MetamodelElement {
    name: string    // FIXME  deviation from proposal!
    features: Feature[] = []    // (containment)
    protected constructor(name: string) {
        this.name = name
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
    constructor(name: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(name)
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
    constructor(name: string) {
        super(name)
    }
    allFeatures(): Feature[] {
        return this.extends.flatMap((conceptInterface) => conceptInterface.allFeatures())
    }
}

class Annotation extends FeaturesContainer {
    platformSpecific?: string
    constructor(name: string) {
        super(name)
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
    constructor(name: string, multiplicity: Multiplicity) {
        super(name, multiplicity)
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

abstract class Datatype implements MetamodelElement {
    name: string    // FIXME  deviation from proposal!
    constructor(name: string) {
        this.name = name
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
 * Sum type of all lioncore type definitions whose meta-type is a concrete Concept.
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

