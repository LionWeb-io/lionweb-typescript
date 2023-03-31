import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    FeaturesContainer,
    Language,
    PrimitiveType,
    Property,
    qualify,
    Reference
} from "./types.ts"
import {SingleRef} from "../references.ts"
import {IdGenerator, nanoIdGen} from "../id-generation.ts"


/**
 * A factory that produces a {@link Language} instance,
 * as well as elements contained by that instance.
 * The {@link https://zelark.github.io/nano-id-cc/ `nanoid`-based} ID generator
 * is used, unless specified otherwise.
 */
export class LanguageFactory {

    readonly id: IdGenerator
    readonly language: Language

    constructor(name: string, version: string, id: IdGenerator = nanoIdGen()) {
        this.id = id
        this.language = new Language(name, version, this.id(name))
    }


    concept(name: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        return new Concept(this.language, name, this.id(qualify(this.language.name, name)), abstract, extends_)
    }

    conceptInterface(name: string) {
        return new ConceptInterface(this.language, name, this.id(qualify(this.language.name, name)))
    }

    enumeration(name: string) {
        return new Enumeration(this.language, name, this.id(qualify(this.language.name, name)))
    }

    primitiveType(name: string) {
        return new PrimitiveType(this.language, name, this.id(qualify(this.language.name, name)))
    }


    containment(featuresContainer: FeaturesContainer, name: string) {
        return new Containment(featuresContainer, name, this.id(qualify(featuresContainer.qualifiedName(), name)))
    }

    property(featuresContainer: FeaturesContainer, name: string) {
        return new Property(featuresContainer, name, this.id(qualify(featuresContainer.qualifiedName(), name)))
    }

    reference(featuresContainer: FeaturesContainer, name: string) {
        return new Reference(featuresContainer, name, this.id(qualify(featuresContainer.qualifiedName(), name)))
    }


    enumerationLiteral(enumeration: Enumeration, name: string) {
        return new EnumerationLiteral(enumeration, name, this.id(qualify(enumeration.qualifiedName(), name)))
    }

}

