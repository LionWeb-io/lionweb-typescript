import {nanoid} from "npm:nanoid@4.0.0"

import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    FeaturesContainer,
    Metamodel,
    PrimitiveType,
    Property,
    Reference
} from "./types.ts"
import {SingleRef} from "../references.ts"


// (internal alias:)
const id = nanoid


/**
 * A factory that produces a {@link Metamodel} instance,
 * as well as elements contained by that instance.
 */
export class MetamodelFactory {

    readonly metamodel: Metamodel

    constructor(qualifiedName: string) {
        this.metamodel = new Metamodel(qualifiedName, id())
    }


    concept(simpleName: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        return new Concept(this.metamodel, simpleName, id(), abstract, extends_)
    }

    conceptInterface(simpleName: string) {
        return new ConceptInterface(this.metamodel, simpleName, id())
    }

    enumeration(simpleName: string) {
        return new Enumeration(this.metamodel, simpleName, id())
    }

    primitiveType(simpleName: string) {
        return new PrimitiveType(this.metamodel, simpleName, id())
    }


    containment(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Containment(featuresContainer, simpleName, id())
    }

    property(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Property(featuresContainer, simpleName, id())
    }

    reference(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Reference(featuresContainer, simpleName, id())
    }


    enumerationLiteral(enumeration: Enumeration, simpleName: string) {
        return new EnumerationLiteral(enumeration, simpleName, id())
    }

}

