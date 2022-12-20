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


export type IdGenerator = () => string

/**
 * A factory that produces a {@link Metamodel} instance,
 * as well as elements contained by that instance.
 */
export class MetamodelFactory {

    readonly id: IdGenerator
    readonly metamodel: Metamodel

    constructor(qualifiedName: string, id: IdGenerator = () => nanoid()) {
        this.id = id
        this.metamodel = new Metamodel(qualifiedName, this.id())
    }


    concept(simpleName: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        return new Concept(this.metamodel, simpleName, this.id(), abstract, extends_)
    }

    conceptInterface(simpleName: string) {
        return new ConceptInterface(this.metamodel, simpleName, this.id())
    }

    enumeration(simpleName: string) {
        return new Enumeration(this.metamodel, simpleName, this.id())
    }

    primitiveType(simpleName: string) {
        return new PrimitiveType(this.metamodel, simpleName, this.id())
    }


    containment(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Containment(featuresContainer, simpleName, this.id())
    }

    property(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Property(featuresContainer, simpleName, this.id())
    }

    reference(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Reference(featuresContainer, simpleName, this.id())
    }


    enumerationLiteral(enumeration: Enumeration, simpleName: string) {
        return new EnumerationLiteral(enumeration, simpleName, this.id())
    }

}

