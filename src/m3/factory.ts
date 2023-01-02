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
    qualify,
    Reference
} from "./types.ts"
import {SingleRef} from "../references.ts"
import {IdGenerator, nanoIdGen} from "../id-generation.ts"


/**
 * A factory that produces a {@link Metamodel} instance,
 * as well as elements contained by that instance.
 * The {@link https://zelark.github.io/nano-id-cc/ `nanoid`-based} ID generator
 * is used, unless specified otherwise.
 */
export class MetamodelFactory {

    readonly id: IdGenerator
    readonly metamodel: Metamodel

    constructor(qualifiedName: string, id: IdGenerator = nanoIdGen()) {
        this.id = id
        this.metamodel = new Metamodel(qualifiedName, this.id(qualifiedName))
    }


    concept(simpleName: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        return new Concept(this.metamodel, simpleName, this.id(qualify(this.metamodel.qualifiedName, simpleName)), abstract, extends_)
    }

    conceptInterface(simpleName: string) {
        return new ConceptInterface(this.metamodel, simpleName, this.id(qualify(this.metamodel.qualifiedName, simpleName)))
    }

    enumeration(simpleName: string) {
        return new Enumeration(this.metamodel, simpleName, this.id(qualify(this.metamodel.qualifiedName, simpleName)))
    }

    primitiveType(simpleName: string) {
        return new PrimitiveType(this.metamodel, simpleName, this.id(qualify(this.metamodel.qualifiedName, simpleName)))
    }


    containment(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Containment(featuresContainer, simpleName, this.id(qualify(featuresContainer.qualifiedName(), simpleName)))
    }

    property(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Property(featuresContainer, simpleName, this.id(qualify(featuresContainer.qualifiedName(), simpleName)))
    }

    reference(featuresContainer: FeaturesContainer, simpleName: string) {
        return new Reference(featuresContainer, simpleName, this.id(qualify(featuresContainer.qualifiedName(), simpleName)))
    }


    enumerationLiteral(enumeration: Enumeration, simpleName: string) {
        return new EnumerationLiteral(enumeration, simpleName, this.id(qualify(enumeration.qualifiedName(), simpleName)))
    }

}

