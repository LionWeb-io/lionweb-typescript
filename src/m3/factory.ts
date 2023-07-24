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
import {KeyGenerator, simpleNameIsKeyGenerator} from "./key-generator.ts"


/**
 * A factory that produces a {@link Language} instance,
 * as well as elements contained by that instance.
 * The {@link https://zelark.github.io/nano-id-cc/ `nanoid`-based} ID generator
 * is used, unless specified otherwise.
 */
export class LanguageFactory {

    readonly id: IdGenerator
    readonly key: KeyGenerator
    readonly language: Language

    constructor(name: string, version: string, id: IdGenerator = nanoIdGen(), key: KeyGenerator = simpleNameIsKeyGenerator) {
        this.id = id
        this.key = key
        this.language = new Language(name, version, this.id(name))
    }


    // TODO  this pattern (post-re-setting the key) is not nice: improve...

    concept(name: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        return new Concept(this.language, name, "", this.id(qualify(this.language.name, name)), abstract, extends_).keyed(this.key)
    }

    conceptInterface(name: string) {
        return new ConceptInterface(this.language, name, "", this.id(qualify(this.language.name, name))).keyed(this.key)
    }

    enumeration(name: string) {
        return new Enumeration(this.language, name, "", this.id(qualify(this.language.name, name))).keyed(this.key)
    }

    primitiveType(name: string) {
        return new PrimitiveType(this.language, name, "", this.id(qualify(this.language.name, name))).keyed(this.key)
    }


    containment(featuresContainer: FeaturesContainer, name: string) {
        return new Containment(featuresContainer, name, "", this.id(qualify(featuresContainer.qualifiedName(), name))).keyed(this.key)
    }

    property(featuresContainer: FeaturesContainer, name: string) {
        return new Property(featuresContainer, name, "", this.id(qualify(featuresContainer.qualifiedName(), name))).keyed(this.key)
    }

    reference(featuresContainer: FeaturesContainer, name: string) {
        return new Reference(featuresContainer, name, "", this.id(qualify(featuresContainer.qualifiedName(), name))).keyed(this.key)
    }


    enumerationLiteral(enumeration: Enumeration, name: string) {
        return new EnumerationLiteral(enumeration, name, "", this.id(qualify(enumeration.qualifiedName(), name))).keyed(this.key)
    }

}

