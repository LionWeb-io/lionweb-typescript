/**
 * TypeScript type definitions for the `lioncore` M3 (=meta-meta) model.
 */


/**
 * The `unresolved` symbol indicates a reference value which hasn't been resolved yet.
 * It differs from an unset (`undefined`) value.
 */
const unresolved = Symbol("unresolved")
/**
 * A type definition for a reference value that can be unresolved.
 */
type SingleRef<T> = typeof unresolved | T


class Metamodel {
    qualifiedName: string
    elements: MetamodelElement[] = []
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


abstract class AbstractConcept implements MetamodelElement, FeaturesContainer {
    name: string    // FIXME  deviation from proposal!
    features: Feature[] = []
    // allFeatures: () => Feature[]
    protected constructor(name: string) {
        this.name = name
    }
    havingFeatures(...features: Feature[]) {
        this.features.push(...features)
        return this
    }
}

class Concept extends AbstractConcept {
    abstract: boolean
    extends?: SingleRef<Concept>    // (reference)
    implements: ConceptInterface[] = []  // (reference)
    features: Feature[] = [] // (containment)
    constructor(name: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(name)
        this.abstract = abstract
        this.extends = extends_
    }
    implementing(...conceptInterfaces: ConceptInterface[]) {
        this.implements.push(...conceptInterfaces)
        return this
    }
}

class ConceptInterface extends AbstractConcept {
    extends: ConceptInterface[] = []
    constructor(name: string) {
        super(name)
    }
}

class Annotation extends AbstractConcept {
    platformSpecific?: string
    constructor(name: string) {
        super(name)
    }
}

enum Multiplicity {
    Optional, Single, ZeroOrMore, OneOrMore
}

interface FeaturesContainer {
    features: Feature[] // (containment)
}

abstract class Feature {
    name: string    // FIXME  deviation from proposal!
    multiplicity: Multiplicity
    derived: boolean = false
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
    type: SingleRef<AbstractConcept> = unresolved
    constructor(name: string, multiplicity: Multiplicity) {
        super(name, multiplicity)
    }
    ofType(type: AbstractConcept) {
        this.type = type
        return this
    }
}

class Reference extends Link {
    specializes: Reference[] = []
}

class Containment extends Link {
    specializes: Containment[] = []
}

class Property extends Feature {
    type: SingleRef<Datatype> = unresolved
    constructor(name: string, multiplicity: Multiplicity) {
        super(name, multiplicity)
    }
    ofType(type: Datatype) {
        this.type = type
        return this
    }
}


abstract class Datatype implements MetamodelElement {
    name: string
    constructor(name: string) {
        this.name = name
    }
}

class Typedef extends Datatype {}

class PrimitiveType extends Datatype {
    constraints: Typedef[] = []
}

class Enumeration extends Datatype {
    literals: EnumerationLiteral[] = []
}

class EnumerationLiteral {
    name: string
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
    AbstractConcept,
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
    FeaturesContainer,
    M3Concept,
    MetamodelElement
}

